import json
import os
from typing import Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

ANALYSIS_PROMPT_PDF = """You are an expert interview preparation coach. Analyze this study material and return ONLY valid JSON.

Given the PDF content below, extract:
1. The main topic/subject
2. Top 10 most important interview questions with page numbers and priority
3. Key concepts and keywords (15-20 terms)
4. A 7-day study roadmap
5. 5 important page ranges to focus on

Return ONLY this JSON structure, no other text:
{{
  "topic": "string",
  "questions": [
    {{"id":"q1","text":"question text","priority":"high|medium|low","page":14,"concept":"concept name"}}
  ],
  "keywords": ["keyword1","keyword2"],
  "roadmap": [
    {{"day":"Day 1","topic":"topic name","pages":"pg 1-20","done":false,"priority":"high|medium|low"}}
  ],
  "important_pages": [
    {{"pg":"14","topic":"concept name"}}
  ]
}}

PDF CONTENT:
{text}
"""

ANALYSIS_PROMPT_TOPIC = """You are an expert interview preparation coach. Generate comprehensive study material for the topic: {topic}

Return ONLY valid JSON in this exact structure:
{{
  "topic": "{topic}",
  "questions": [
    {{"id":"q1","text":"question text","priority":"high|medium|low","page":null,"concept":"concept name"}}
  ],
  "keywords": ["keyword1","keyword2"],
  "roadmap": [
    {{"day":"Day 1","topic":"topic to study","pages":"","done":false,"priority":"high|medium|low"}}
  ],
  "important_pages": []
}}

Generate 12 high-quality interview questions, 20 keywords, and a 7-day roadmap.
"""

async def analyze_with_claude(text: Optional[str], source: str, topic: str) -> dict:
    if source == "pdf" and text:
        # Llama 3.3 70b handles big context elegantly, keeping the slice safe
        prompt = ANALYSIS_PROMPT_PDF.format(text=text[:15000])
    else:
        prompt = ANALYSIS_PROMPT_TOPIC.format(topic=topic)

    # Call Groq with forced JSON mode config
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You only output raw, valid JSON matching the requested schema. Do not include markdown formatting or backticks."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.3
    )

    raw = completion.choices[0].message.content.strip()
    
    # Strip markdown fences if present (fallback safety check)
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    result = json.loads(raw)
    result["source"] = source
    return result