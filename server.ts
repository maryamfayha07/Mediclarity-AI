import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parsers with limit for file uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Initialize Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const SYSTEM_INSTRUCTION = `You are a compassionate medical deconstruction expert, clinical translator, and patient educator.

Your role is to convert medical reports into accurate, warm, easy-to-understand explanations.

Rules:
* Explain biomarkers instead of diagnosing.
* Use simple analogies.
* Highlight abnormal values compared with reference ranges.
* Avoid panic or alarming language.
* Clearly mention serious abnormalities.
* Encourage professional medical discussion.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A warm, patient-friendly summary of the overall report."
    },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          finding: { type: Type.STRING, description: "Name of the finding or clinical area." },
          severity: { type: Type.STRING, description: "Must be 'Normal' (Green), 'Attention' (Amber), or 'Abnormal' (Rose)." },
          details: { type: Type.STRING, description: "Empathetic, clear deconstruction of what this finding means." }
        },
        required: ["finding", "severity", "details"]
      }
    },
    abnormalValues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          testName: { type: Type.STRING, description: "Name of the specific marker/test." },
          value: { type: Type.STRING, description: "The patient's actual result value." },
          referenceRange: { type: Type.STRING, description: "The normal reference range (e.g. 70-100 mg/dL)." },
          status: { type: Type.STRING, description: "Must be 'High', 'Low', 'Critical', or 'Normal'." },
          note: { type: Type.STRING, description: "Clear, patient-friendly meaning of this value." }
        },
        required: ["testName", "value", "referenceRange", "status", "note"]
      }
    },
    medicalTerms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING, description: "The medical term or jargon word." },
          simpleExplanation: { type: Type.STRING, description: "Easy to understand patient-friendly explanation." }
        },
        required: ["term", "simpleExplanation"]
      }
    },
    possibleMeaning: {
      type: Type.STRING,
      description: "Detailed description of what these group of biomarkers mean collectively. Connect them with easy-to-understand analogies."
    },
    risk: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.STRING, description: "Must be 'LOW', 'MEDIUM', or 'HIGH'." },
        explanation: { type: Type.STRING, description: "Clear and highly educational explanation of why this risk level was estimated." }
      },
      required: ["level", "explanation"]
    },
    lifestyleSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Category name: Hydration, Nutrition, Sleep, Exercise, or Stress Management." },
          advice: { type: Type.STRING, description: "Educational action suggestion (No prescriptions)." },
          benefit: { type: Type.STRING, description: "The health benefit of following this advice." }
        },
        required: ["category", "advice", "benefit"]
      }
    },
    doctorQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 to 5 clear, empowering questions the patient can ask their doctor."
    }
  },
  required: [
    "summary",
    "findings",
    "abnormalValues",
    "medicalTerms",
    "possibleMeaning",
    "risk",
    "lifestyleSuggestions",
    "doctorQuestions"
  ]
};

// Main decoding endpoint
app.post("/api/decode", async (req, res) => {
  try {
    const { textReport, fileData, mimeType } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please set it in the Secrets panel."
      });
    }

    // Build the contents payload for Gemini
    let contents: any[] = [];

    if (fileData && mimeType) {
      // Multimodal input: strip any prefix if sent
      const base64Data = fileData.replace(/^data:.*?;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    const textPrompt = textReport
      ? `Here is the medical report/values to decode:\n\n${textReport}\n\nDeconstruct this report fully into the structured JSON schema.`
      : "Decode the attached medical report file fully into the structured JSON schema.";

    contents.push({ text: textPrompt });

    let responseText = "";
    let modelUsed = "gemini-2.5-flash";

    try {
      console.log("Attempting to parse report using primary model: gemini-2.5-flash");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
        },
      });
      responseText = response.text || "";
    } catch (proError: any) {
      console.warn("Primary model (gemini-2.5-flash) failed or rate-limited. Falling back to gemini-2.5-pro.", proError.message || proError);
      modelUsed = "gemini-2.5-pro";
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
        },
      });
      responseText = response.text || "";
    }

    if (!responseText) {
      throw new Error("Empty response from Gemini API.");
    }

    const resultJson = JSON.parse(responseText);
    res.json({ success: true, data: resultJson, modelUsed });

  } catch (error: any) {
    console.error("Analysis decoding failed:", error);
    res.status(500).json({
      error: error.message || "An error occurred during medical report analysis."
    });
  }
});

// Translation Endpoint
app.post("/api/translate", async (req, res) => {
  try {
    const { medicalData, targetLanguage } = req.body;

    if (!medicalData || !targetLanguage) {
      return res.status(400).json({ error: "Missing medicalData or targetLanguage" });
    }

    if (targetLanguage.toLowerCase() === "english") {
      return res.json({ success: true, data: medicalData });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "API key is missing." });
    }

    console.log(`Translating medical analysis into language: ${targetLanguage}`);

    const translationPrompt = `You are a professional medical translator.
Your task is to translate ALL user-facing text values in the provided JSON object from English to ${targetLanguage}.
Keep all JSON keys exactly identical. Do NOT translate or modify the keys. Only translate the string values (or array string elements).
Make sure the translated medical terminology is accurate, patient-friendly, warm, and natural in ${targetLanguage}.

Here is the JSON object to translate:
${JSON.stringify(medicalData, null, 2)}`;

    let responseText = "";
    // We can use the fast gemini-2.5-flash model for translation to reduce cost and latency
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: translationPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });
      responseText = response.text || "";
    } catch (err) {
      console.warn("Translation failed with 2.5-flash, trying 2.5-pro fallback...", err);
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: translationPrompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });
        responseText = response.text || "";
      } catch (fallbackErr) {
        console.error("Translation fail with 2.5-pro fallback:", fallbackErr);
        throw fallbackErr;
      }
    }

    const translatedJson = JSON.parse(responseText);
    res.json({ success: true, data: translatedJson });

  } catch (error: any) {
    console.error("Translation failed:", error);
    res.status(500).json({
      error: `Translation failed: ${error.message || error}`
    });
  }
});

// Setup dev server or static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediClarity AI server running on port ${PORT}`);
  });
}

startServer();
