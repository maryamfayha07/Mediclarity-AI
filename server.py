import os
import json
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load local environment variables from .env file
load_dotenv()

app = FastAPI(
    title="MediClarity AI - Python Backend",
    description="Python FastAPI backend replicating the TypeScript Express server for medical report analysis.",
    version="1.0.0"
)

# Enable CORS so your React frontend can communicate with the Python server if run locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize official Google GenAI Client
# In the new google-genai library, the client is initialized via: client = genai.Client()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

SYSTEM_INSTRUCTION = """You are a compassionate medical deconstruction expert, clinical translator, and patient educator.

Your role is to convert medical reports into accurate, warm, easy-to-understand explanations.

Rules:
* Explain biomarkers instead of diagnosing.
* Use simple analogies.
* Highlight abnormal values compared with reference ranges.
* Avoid panic or alarming language.
* Clearly mention serious abnormalities.
* Encourage professional medical discussion."""

# Define the precise Gemini response schema using standard Pydantic models (highly compatible with google-genai)
class FindingItem(BaseModel):
    finding: str = Field(description="Name of the finding or clinical area.")
    severity: str = Field(description="Must be 'Normal' (Green), 'Attention' (Amber), or 'Abnormal' (Rose).")
    details: str = Field(description="Empathetic, clear deconstruction of what this finding means.")

class AbnormalValueItem(BaseModel):
    testName: str = Field(description="Name of the specific marker/test.")
    value: str = Field(description="The patient's actual result value.")
    referenceRange: str = Field(description="The normal reference range (e.g. 70-100 mg/dL).")
    status: str = Field(description="Must be 'High', 'Low', 'Critical', or 'Normal'.")
    note: str = Field(description="Clear, patient-friendly meaning of this value.")

class MedicalTermItem(BaseModel):
    term: str = Field(description="The medical term or jargon word.")
    simpleExplanation: str = Field(description="Easy to understand patient-friendly explanation.")

class LifestyleSuggestionItem(BaseModel):
    category: str = Field(description="Category name: Hydration, Nutrition, Sleep, Exercise, or Stress Management.")
    advice: str = Field(description="Educational action suggestion (No prescriptions).")
    benefit: str = Field(description="The health benefit of following this advice.")

class RiskInfo(BaseModel):
    level: str = Field(description="Must be 'LOW', 'MEDIUM', or 'HIGH'.")
    explanation: str = Field(description="Clear and highly educational explanation of why this risk level was estimated.")

class DecodedMedicalReport(BaseModel):
    summary: str = Field(description="A warm, patient-friendly summary of the overall report.")
    findings: List[FindingItem]
    abnormalValues: List[AbnormalValueItem]
    medicalTerms: List[MedicalTermItem]
    possibleMeaning: str = Field(description="Detailed description of what these group of biomarkers mean collectively. Connect them with easy-to-understand analogies.")
    risk: RiskInfo
    lifestyleSuggestions: List[LifestyleSuggestionItem]
    doctorQuestions: List[str] = Field(description="3 to 5 clear, empowering questions the patient can ask their doctor.")


# Request Models
class DecodeRequest(BaseModel):
    textReport: Optional[str] = None
    fileData: Optional[str] = None
    mimeType: Optional[str] = None

class TranslateRequest(BaseModel):
    medicalData: dict
    targetLanguage: str


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "MediClarity Python Backend"}


@app.post("/api/decode")
async def decode_report(payload: DecodeRequest):
    """
    Decodes clinical notes, laboratory parameters, or uploaded images/PDF reports 
    using Google Gemini API on Python.
    """
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY environment variable is not configured on this Python server."
        )

    # 1. Prepare contents
    contents = []

    # If file content is uploaded (multimodal analysis)
    if payload.fileData and payload.mimeType:
        # Strip data URL prefix if present (e.g. 'data:image/png;base64,')
        base64_data = payload.fileData
        if "," in base64_data:
            base64_data = base64_data.split(",")[1]

        contents.append(
            types.Part.from_bytes(
                data=base64_data.encode("utf-8"),
                mime_type=payload.mimeType
            )
        )

    # Text report prompt
    prompt_text = (
        f"Here is the medical report/values to decode:\n\n{payload.textReport}\n\nDeconstruct this report fully into the structured JSON schema."
        if payload.textReport
        else "Decode the attached medical report file fully into the structured JSON schema."
    )
    contents.append(prompt_text)

    # 2. Query Gemini with fallback models
    model_used = "gemini-2.5-flash"
    try:
        print(f"Attempting to parse report using primary model: {model_used}")
        response = client.models.generate_content(
            model=model_used,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=DecodedMedicalReport,
                temperature=0.2,
            )
        )
        response_text = response.text
    except Exception as e:
        print(f"Primary model (gemini-2.5-flash) failed. Falling back to gemini-2.5-pro... Error: {e}")
        model_used = "gemini-2.5-pro"
        try:
            response = client.models.generate_content(
                model=model_used,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=DecodedMedicalReport,
                    temperature=0.2,
                )
            )
            response_text = response.text
        except Exception as err:
            print(f"Fallback model (gemini-2.5-pro) failed too: {err}")
            raise HTTPException(status_code=500, detail=f"Gemini generation failed: {str(err)}")

    if not response_text:
        raise HTTPException(status_code=500, detail="Received an empty response from the Gemini model.")

    try:
        parsed_json = json.loads(response_text)
        return {"success": True, "data": parsed_json, "modelUsed": model_used}
    except Exception as parse_error:
        print(f"Failed to parse JSON response: {parse_error}")
        raise HTTPException(status_code=500, detail="Failed to parse valid structured JSON from Gemini output.")


@app.post("/api/translate")
async def translate_report(payload: TranslateRequest):
    """
    Translates user-facing values inside the decoded medical report into the target language 
    using Google Gemini API on Python.
    """
    target_lang = payload.targetLanguage
    med_data = payload.medicalData

    if not med_data or not target_lang:
        raise HTTPException(status_code=400, detail="Missing medicalData or targetLanguage in payload.")

    if target_lang.strip().lower() == "english":
        return {"success": True, "data": med_data}

    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    print(f"Translating medical analysis into language: {target_lang}")

    translation_prompt = f"""You are a professional medical translator.
Your task is to translate ALL user-facing text values in the provided JSON object from English to {target_lang}.
Keep all JSON keys exactly identical. Do NOT translate or modify the keys. Only translate the string values (or array string elements).
Make sure the translated medical terminology is accurate, patient-friendly, warm, and natural in {target_lang}.

Here is the JSON object to translate:
{json.dumps(med_data, indent=2)}"""

    model_used = "gemini-2.5-flash"
    try:
        response = client.models.generate_content(
            model=model_used,
            contents=translation_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            )
        )
        response_text = response.text
    except Exception as e:
        print(f"Translation failed with {model_used}, falling back to gemini-2.5-pro... Error: {e}")
        model_used = "gemini-2.5-pro"
        try:
            response = client.models.generate_content(
                model=model_used,
                contents=translation_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                )
            )
            response_text = response.text
        except Exception as err:
            print(f"Translation failed with 2.5-pro fallback: {err}")
            raise HTTPException(status_code=500, detail=f"Translation failed: {str(err)}")

    if not response_text:
        raise HTTPException(status_code=500, detail="Empty response received during translation.")

    try:
        parsed_json = json.loads(response_text)
        return {"success": True, "data": parsed_json}
    except Exception as parse_err:
        print(f"Translation JSON parsing failed: {parse_err}")
        raise HTTPException(status_code=500, detail="Failed to parse translated structured JSON.")


if __name__ == "__main__":
    import uvicorn
    # To run this Python file: python server.py
    print("Starting MediClarity Python FastAPI server on http://127.0.0.1:8000")
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
