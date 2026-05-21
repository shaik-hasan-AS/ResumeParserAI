import fitz  # PyMuPDF
import pytesseract
from PIL import Image
from io import BytesIO
import shutil
import os

# Try to automatically find Tesseract in various common deployment locations
tess_cmd = shutil.which("tesseract")
if tess_cmd:
    pytesseract.pytesseract.tesseract_cmd = tess_cmd
elif os.path.exists("/usr/bin/tesseract"):
    pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
elif os.path.exists("/app/.apt/usr/bin/tesseract"):
    pytesseract.pytesseract.tesseract_cmd = "/app/.apt/usr/bin/tesseract"
elif os.path.exists("/workspace/.apt/usr/bin/tesseract"):
    pytesseract.pytesseract.tesseract_cmd = "/workspace/.apt/usr/bin/tesseract"

def local_ocr_image(image_bytes: bytes) -> str:
    """
    Extract text locally from image bytes (JPG, JPEG, PNG) using Tesseract OCR.
    """
    try:
        image = Image.open(BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except pytesseract.TesseractNotFoundError:
        return f"Error: Tesseract OCR is not installed or not in PATH (Checked {pytesseract.pytesseract.tesseract_cmd})"
    except Exception as e:
        return f"Error extracting text from image locally: {type(e).__name__} - {str(e)}"

def local_ocr_pdf(pdf_bytes: bytes) -> str:
    """
    Render scanned PDF pages locally to in-memory images and run OCR using Tesseract.
    """
    try:
        # Open PDF from bytes
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = ""
        
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            
            # Render page to an image (Pixmap)
            # 150 DPI is usually sufficient for good OCR accuracy and performance
            pix = page.get_pixmap(dpi=150)
            
            # Convert Pixmap to PIL Image
            image_data = pix.tobytes("png")
            image = Image.open(BytesIO(image_data))
            
            # Run Tesseract OCR on page image
            page_text = pytesseract.image_to_string(image)
            full_text += f"\n--- Page {page_num + 1} ---\n" + page_text
            
        return full_text
    except pytesseract.TesseractNotFoundError:
        return f"Error: Tesseract OCR is not installed or not in PATH (Checked {pytesseract.pytesseract.tesseract_cmd})"
    except Exception as e:
        return f"Error performing local OCR on PDF: {type(e).__name__} - {str(e)}"
