import os
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Pydantic response models for strict JSON schema enforcement
class Finding(BaseModel):
    finding: str = Field(description="Name of the finding or clinical area.")
    severity: str = Field(description="Must be 'Normal' (Green), 'Attention' (Amber), or 'Abnormal' (Rose).")
    details: str = Field(description="Empathetic, clear patient-friendly deconstruction.")

class AbnormalValue(BaseModel):
    testName: str = Field(description="Name of the specific biomarker/test.")
    value: str = Field(description="The actual recorded value.")
    referenceRange: str = Field(description="The reference interval (normal range).")
    status: str = Field(description="Must be 'High', 'Low', 'Critical', or 'Normal'.")
    note: str = Field(description="Patient-friendly clinical meaning of this outlier value.")

class MedicalTerm(BaseModel):
    term: str = Field(description="The medical terminology or jargon term.")
    simpleExplanation: str = Field(description="An easy, layman translation of the term.")

class Risk(BaseModel):
    level: str = Field(description="Estimated assessment level: 'LOW', 'MEDIUM', or 'HIGH'.")
    explanation: str = Field(description="The explanation behind the estimated level.")

class LifestyleSuggestion(BaseModel):
    category: str = Field(description="Must be: Hydration, Nutrition, Sleep, Exercise, or Stress Management.")
    advice: str = Field(description="Helpful wellness, non-medicinal guidance.")
    benefit: str = Field(description="The clinical wellness benefit of following this advice.")

class MedicalAnalysisSchema(BaseModel):
    summary: str = Field(description="A warm, patient-friendly summary of the overall findings.")
    findings: List[Finding]
    abnormalValues: List[AbnormalValue]
    medicalTerms: List[MedicalTerm]
    possibleMeaning: str = Field(description="Collective clinical significance of indicators using analogies.")
    risk: Risk
    lifestyleSuggestions: List[LifestyleSuggestion]
    doctorQuestions: List[str] = Field(description="3 to 5 clear empowering questions for physician consult.")


class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY env var is missing. API calls will rely on environment injection.")
        # Initialize Google GenAI client
        self.client = genai.Client(api_key=api_key)
        self.system_instruction = (
            "You are a compassionate medical deconstruction expert, clinical translator, and patient educator.\n\n"
            "Your role is to convert medical reports into accurate, warm, easy-to-understand explanations.\n\n"
            "Rules:\n"
            "* Explain biomarkers instead of diagnosing.\n"
            "* Use simple analogies.\n"
            "* Highlight abnormal values compared with reference ranges.\n"
            "* Avoid panic or alarming language.\n"
            "* Clearly mention serious abnormalities.\n"
            "* Encourage professional medical discussion."
        )

    def analyze_report(self, text_content: str, file_bytes: Optional[bytes] = None, mime_type: Optional[str] = None) -> MedicalAnalysisSchema:
        contents = []
        
        # Add multimodal document/image if present
        if file_bytes and mime_type:
            contents.append(
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type
                )
            )
            
        text_prompt = (
            f"Here is the medical data to decode:\n\n{text_content}\n\n"
            "Process and structure this information exactly into the required schema."
            if text_content else
            "Process the attached medical report file and structure it exactly into the required schema."
        )
        contents.append(text_prompt)

        # Primary Model: gemini-2.5-pro
        try:
            logger.info("Sending request to primary model: gemini-2.5-pro")
            response = self.client.models.generate_content(
                model='gemini-2.5-pro',
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    response_mime_type="application/json",
                    response_schema=MedicalAnalysisSchema,
                    temperature=0.2,
                )
            )
            return response.text
        except Exception as e:
            logger.warning(f"Primary model (gemini-2.5-pro) failed or rate-limited: {e}. Falling back to gemini-2.5-flash.")
            
            # Fallback Model: gemini-2.5-flash
            try:
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=self.system_instruction,
                        response_mime_type="application/json",
                        response_schema=MedicalAnalysisSchema,
                        temperature=0.2,
                    )
                )
                return response.text
            except Exception as flash_err:
                logger.error(f"Fallback model failed: {flash_err}")
                raise flash_err
