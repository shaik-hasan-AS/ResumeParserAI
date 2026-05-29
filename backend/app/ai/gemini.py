import json
import re
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List

class BulletPointRewrite(BaseModel):
    original: str = Field(description="The original weak bullet point from the resume.")
    improved: str = Field(description="The rewritten, impact-driven bullet point.")
    reasoning: str = Field(description="Why the new bullet point is better.")

class ExperienceEntry(BaseModel):
    job_title: str = Field(description="The job title or role.")
    company: str = Field(description="The name of the company or organization.")
    dates: str = Field(description="The dates of employment (e.g., 'Jan 2020 - Present').")
    bullet_points: List[str] = Field(description="List of optimized, impact-driven bullet points for this role.")

class ResumeEvaluation(BaseModel):
    score: int = Field(description="ATS match score from 0-100.")
    keyword_match_rate: int = Field(description="Percentage (0-100) of how well the skills match the required keywords.")
    summary: str = Field(description="Overall summary string evaluating their fit for the role.")
    executive_summary_for_resume: str = Field(description="A professional, 2-3 sentence executive summary written in the first person (or objective third person) to be placed at the top of the candidate's actual resume.")
    highlight_skills: List[str] = Field(description="A list of 3-7 specific skills from the candidate's existing skills that perfectly match the target role and should be bolded/highlighted on the resume.", default_factory=list)
    strengths: List[str] = Field(description="List of strengths found in the resume.")
    weaknesses: List[str] = Field(description="List of weaknesses or areas to improve.")
    missing_skills: List[str] = Field(description="Suggested skills to add for the role.")
    recommended_certifications: List[str] = Field(description="Highly relevant certifications for this candidate.")
    actionable_improvements: List[str] = Field(description="Concrete, step-by-step actions to fix the weaknesses.")
    bullet_point_rewrites: List[BulletPointRewrite] = Field(description="Examples of how to rewrite weak experience bullets for maximum impact.")
    structured_experience: List[ExperienceEntry] = Field(description="The candidate's experience completely parsed and formatted. CRITICAL: Do NOT summarize or omit any jobs. Preserve the full depth and ALL bullet points of their original experience, but rewrite them to be stronger, metric-driven, and highly ATS-optimized.", default_factory=list)

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
    
    # Redact PII from the parsed_data dict itself before sending to API
    redacted_parsed_data = parsed_data.copy()
    if redacted_parsed_data.get("name"):
        redacted_parsed_data["name"] = "[REDACTED NAME]"
    if redacted_parsed_data.get("email"):
        redacted_parsed_data["email"] = "[REDACTED EMAIL]"
    if redacted_parsed_data.get("phone"):
        redacted_parsed_data["phone"] = "[REDACTED PHONE]"
    
    role_context = f"The candidate is specifically applying for the role of: **{target_role}**." if target_role else "The candidate has not specified a target role, so evaluate based on general professional standards and the skills present."
    
    prompt = f"""
    Review the following redacted resume text and parsed data.
    
    {role_context}
    
    Parsed Data: {redacted_parsed_data}
    Raw Text: {redacted_text}
    """
    
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResumeEvaluation,
                temperature=0.2,
                system_instruction="You are an advanced, strict Applicant Tracking System (ATS) and expert technical recruiter. Your task is to evaluate the resume strictly against the target role (if provided). Calculate a realistic ATS match score (0-100) based on keyword matching, measurable achievements, action verbs, and proper formatting. Provide actionable feedback to improve the resume."
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
                "keyword_match_rate": 0,
                "summary": f"Error calling Gemini API: {str(e)}",
                "executive_summary_for_resume": "",
                "highlight_skills": [],
                "strengths": [],
                "weaknesses": [],
                "missing_skills": [],
                "recommended_certifications": [],
                "actionable_improvements": [],
                "bullet_point_rewrites": [],
                "structured_experience": []
            })
        }
