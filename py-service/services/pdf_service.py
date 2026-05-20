import fitz  # PyMuPDF
from typing import Optional

def extract_pdf_text(content: bytes) -> str:
    """Extract all text from PDF bytes using PyMuPDF"""
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        pages_text = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text.strip():
                pages_text.append(f"[PAGE {page_num + 1}]\n{text}")
        doc.close()
        return "\n\n".join(pages_text)
    except Exception as e:
        raise ValueError(f"PDF extraction failed: {str(e)}")

def get_page_count(content: bytes) -> int:
    doc = fitz.open(stream=content, filetype="pdf")
    count = len(doc)
    doc.close()
    return count
