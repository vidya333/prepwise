from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from services.pdf_service import extract_pdf_text
from services.ai_service import analyze_with_claude

router = APIRouter()

class TopicRequest(BaseModel):
    topic: str

@router.post("/pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are accepted")
    content = await file.read()
    text = extract_pdf_text(content)
    if not text.strip():
        raise HTTPException(400, "Could not extract text from PDF")
    result = await analyze_with_claude(text=text, source="pdf", topic=file.filename)
    return result

@router.post("/topic")
async def analyze_topic(body: TopicRequest):
    if not body.topic.strip():
        raise HTTPException(400, "Topic is required")
    result = await analyze_with_claude(text=None, source="topic", topic=body.topic)
    return result
