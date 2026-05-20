import json
import re
from google import genai
from google.genai import types

def redact_pii(text: str, parsed_data: dict) -> str:
    redacted_text = text
    if parsed_data.get("name"):
        # simple replacement for the name
        redacted_text = redacted_text.replace(parsed_data["name"], "[REDACTED NAME]")
    if parsed_data.get("email"):
        redacted_text = redacted_text.replace(parsed_data["email"], "[REDACTED EMAIL]")
    if parsed_data.get("phone"):
        redacted_text = redacted_text.replace(parsed_data["phone"], "[REDACTED PHONE]")
    
    # Also redact email and phone aggressively using regex just in case they were missed by parser
    redacted_text = re.sub(r'[\w\.-]+@[\w\.-]+', '[REDACTED EMAIL]', redacted_text)
    redacted_text = re.sub(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', '[REDACTED PHONE]', redacted_text)
    
    return redacted_text

def generate_feedback(parsed_data: dict, raw_text: str, target_role: str = None) -> dict:
    redacted_text = redact_pii(raw_text, parsed_data)
    
    role_context = f"The candidate is specifically applying for the role of: **{target_role}**." if target_role else "The candidate has not specified a target role, so evaluate based on general professional standards and the skills present."
    
    prompt = f"""
    You are an advanced, strict Applicant Tracking System (ATS) and expert technical recruiter. 
    Review the following redacted resume text and parsed data.
    
    {role_context}
    
    Your task is to evaluate the resume strictly against the target role (if provided). 
    Calculate a realistic ATS match score (0-100) based on:
    1. Keyword matching for the target role.
    2. Presence of measurable achievements (numbers, metrics).
    3. Action verbs and impact-driven descriptions.
    4. Proper formatting and structure.
    
    Provide your output EXACTLY as a valid JSON object with the following schema:
    {{
        "score": number (0-100),
        "summary": "overall summary string evaluating their fit for the role",
        "strengths": ["list", "of", "strengths"],
        "weaknesses": ["list", "of", "weaknesses"],
        "missing_skills": ["list", "of", "suggested", "skills", "for", "the", "role"],
        "recommended_certifications": ["list", "of", "highly", "relevant", "certifications", "for", "this", "candidate"]
    }}
    
    Parsed Data: {parsed_data}
    Raw Text: {redacted_text}
    
    Return ONLY the valid JSON object. Do not include markdown code blocks around the JSON.
    """
    
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # We store the raw JSON string in feedback_text so the frontend can parse it.
        # Alternatively, we extract the score.
        try:
            parsed_response = json.loads(response.text)
            score = parsed_response.get("score", 75)
        except json.JSONDecodeError:
            score = 0
            
        return {
            "score": score,
            "feedback_text": response.text
        }
    except Exception as e:
        return {
            "score": 0,
            "feedback_text": json.dumps({
                "score": 0,
                "summary": f"Error calling Gemini API: {str(e)}",
                "strengths": [],
                "weaknesses": [],
                "missing_skills": [],
                "recommended_certifications": []
            })
        }
