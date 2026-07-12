import os
import json
import logging
from typing import Optional
from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

from backend.gemini_service import GeminiService
from backend.report_parser import ReportParser
from backend.translator import Translator

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MediClarityAI")

app = FastAPI(title="MediClarity AI - Universal Interpreter")

# Ensure folders exist
os.makedirs("frontend/static", exist_ok=True)
os.makedirs("frontend/templates", exist_ok=True)

# Mount static files if directory exists and has files
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

templates = Jinja2Templates(directory="frontend/templates")

# Initialize services
gemini_service = GeminiService()
translator_service = Translator()

@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    """Serves the main patient application workspace."""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/decode")
async def decode_report(
    textReport: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """Decodes a text input or uploaded file (PDF, TXT, Image) using Gemini AI."""
    try:
        extracted_text = ""
        file_bytes = None
        mime_type = None

        if file:
            logger.info(f"Received file upload: {file.filename} ({file.content_type})")
            file_bytes = await file.read()
            mime_type = file.content_type
            # Extract plain text if possible, to send alongside as text context, 
            # or pass file bytes directly to gemini for multimodal parsing
            extracted_text = ReportParser.extract_text(file_bytes, file.filename, file.content_type)
        
        # Combine text input and extracted text if both exist
        input_text = textReport or ""
        if extracted_text and extracted_text not in input_text:
            if input_text:
                input_text += f"\n\n--- Extracted File Text ---\n{extracted_text}"
            else:
                input_text = extracted_text

        if not input_text and not file_bytes:
            raise HTTPException(status_code=400, detail="No report data or file provided.")

        # Invoke Gemini Service
        # We can pass raw file_bytes and its mime_type to the service for native multimodal processing
        logger.info("Executing Gemini interpretation analysis")
        analysis_json_str = gemini_service.analyze_report(
            text_content=input_text,
            file_bytes=file_bytes,
            mime_type=mime_type
        )
        
        analysis_data = json.loads(analysis_json_str)
        return {"success": True, "data": analysis_data}

    except Exception as e:
        logger.error(f"Error decoding medical report: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.post("/api/translate")
async def translate_report(request: Request):
    """Translates the analyzed JSON data into one of the 10 supported languages."""
    try:
        body = await request.json()
        medical_data = body.get("medicalData")
        target_language = body.get("targetLanguage")

        if not medical_data or not target_language:
            raise HTTPException(status_code=400, detail="Missing medicalData or targetLanguage")

        translated_data = translator_service.translate_json(medical_data, target_language)
        return {"success": True, "data": translated_data}

    except Exception as e:
        logger.error(f"Error during translation request: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )
