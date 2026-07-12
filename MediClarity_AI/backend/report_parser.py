import io
import logging
from typing import Optional

# Safe imports for optional third-party Python packages
try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import pytesseract
except ImportError:
    pytesseract = None

logger = logging.getLogger(__name__)

class ReportParser:
    @staticmethod
    def parse_txt(file_bytes: bytes) -> str:
        """Parses raw text file bytes."""
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                return file_bytes.decode("latin-1")
            except Exception as e:
                logger.error(f"Failed to parse text file: {e}")
                return ""

    @staticmethod
    def parse_pdf(file_bytes: bytes) -> str:
        """Parses PDF text using PyMuPDF (fitz), with OCR fallback logic."""
        if not fitz:
            logger.warning("PyMuPDF (fitz) is not installed. PDF text parsing is unavailable.")
            return "Error: PyMuPDF is not installed."
        
        extracted_text = []
        try:
            pdf_doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in pdf_doc:
                text = page.get_text()
                extracted_text.append(text)
            
            combined_text = "\n".join(extracted_text).strip()
            
            # Fallback to OCR if the PDF is scanned (contains no selectable text)
            if not combined_text and pytesseract and Image:
                logger.info("PDF selectable text is empty. Attempting OCR on PDF pages...")
                ocr_text = []
                for page_num in range(len(pdf_doc)):
                    page = pdf_doc[page_num]
                    pix = page.get_pixmap(dpi=150)
                    img_data = pix.tobytes("png")
                    img = Image.open(io.BytesIO(img_data))
                    text = pytesseract.image_to_string(img)
                    ocr_text.append(text)
                combined_text = "\n".join(ocr_text).strip()
                
            return combined_text
        except Exception as e:
            logger.error(f"Failed to parse PDF document: {e}")
            return f"Error parsing PDF: {str(e)}"

    @staticmethod
    def parse_image(file_bytes: bytes) -> str:
        """Extracts text from images using pytesseract OCR."""
        if not Image:
            return "Error: PIL (Pillow) is not installed."
        if not pytesseract:
            logger.warning("pytesseract is not installed. OCR image text parsing is unavailable.")
            return "Error: pytesseract is not installed."

        try:
            img = Image.open(io.BytesIO(file_bytes))
            extracted_text = pytesseract.image_to_string(img)
            return extracted_text.strip()
        except Exception as e:
            logger.error(f"Failed to perform OCR on image: {e}")
            return f"Error running OCR: {str(e)}"

    @classmethod
    def extract_text(cls, file_bytes: bytes, filename: str, mime_type: str) -> str:
        """Determines the correct file format and extracts readable text."""
        name_lower = filename.lower()
        if name_lower.endswith(".txt") or "text/plain" in mime_type:
            return cls.parse_txt(file_bytes)
        elif name_lower.endswith(".pdf") or "application/pdf" in mime_type:
            return cls.parse_pdf(file_bytes)
        elif name_lower.endswith((".png", ".jpg", ".jpeg", ".webp")) or "image/" in mime_type:
            return cls.parse_image(file_bytes)
        else:
            # Try plain text fallback
            return cls.parse_txt(file_bytes)
