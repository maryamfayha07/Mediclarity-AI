import os
import json
import logging
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class Translator:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=api_key)

    def translate_json(self, data_dict: dict, target_language: str) -> dict:
        """Translates all the string values of a structured JSON dictionary while preserving the keys."""
        if not target_language or target_language.lower() == "english":
            return data_dict

        translation_prompt = (
            f"You are a professional medical translator.\n"
            f"Your task is to translate ALL user-facing text values in the provided JSON object from English to {target_language}.\n"
            f"Keep all JSON keys exactly identical. Do NOT translate or modify the keys.\n"
            f"Only translate the string values (or list/array string items).\n"
            f"Ensure translated medical terminology is precise, clinical, yet patient-friendly and natural in {target_language}.\n\n"
            f"JSON to translate:\n"
            f"{json.dumps(data_dict, indent=2)}"
        )

        try:
            logger.info(f"Translating JSON data to {target_language} using gemini-2.5-flash")
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=translation_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            
            translated_json_str = response.text
            if not translated_json_str:
                raise ValueError("Received empty translation response.")
            
            translated_data = json.loads(translated_json_str)
            return translated_data
        except Exception as e:
            logger.error(f"Translation failed: {e}. Returning original English report.")
            return data_dict
