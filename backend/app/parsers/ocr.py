import fitz  # PyMuPDF
import pytesseract
from PIL import Image
from io import BytesIO

def local_ocr_image(image_bytes: bytes) -> str:
    """
    Extract text locally from image bytes (JPG, JPEG, PNG) using Tesseract OCR.
    """
    try:
        image = Image.open(BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        return f"Error extracting text from image locally: {str(e)}"

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
    except Exception as e:
        return f"Error performing local OCR on PDF: {str(e)}"
