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
    strengths: List[str] = Field(description="List of strengths found in the resume.")
    weaknesses: List[str] = Field(description="List of weaknesses or areas to improve.")
    missing_skills: List[str] = Field(description="Suggested skills to add for the role.")
    recommended_certifications: List[str] = Field(description="Highly relevant certifications for this candidate.")
    actionable_improvements: List[str] = Field(description="Concrete, step-by-step actions to fix the weaknesses.")
    bullet_point_rewrites: List[BulletPointRewrite] = Field(description="Examples of how to rewrite weak experience bullets for maximum impact.")
    structured_experience: List[ExperienceEntry] = Field(description="The candidate's experience completely parsed, formatted, and optimized. Rewrite any weak bullet points for maximum impact. If no experience is found, return an empty list.", default_factory=list)

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

def generate_feedback(parsed_data: dict, raw_text: str, target_role: str = None, job_description: str = None) -> dict:
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
    jd_context = f"\n\nHere is the Job Description for the target role:\n{job_description}\n\nPlease strictly evaluate the candidate's fit against the requirements, keywords, and skills mentioned in this job description." if job_description else ""
    
    prompt = f"""
    Review the following redacted resume text and parsed data.
    
    {role_context}{jd_context}
    
    Parsed Data: {redacted_parsed_data}
    Raw Text: {redacted_text}
    """
    
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResumeEvaluation,
                temperature=0.2,
                system_instruction="You are an advanced, strict Applicant Tracking System (ATS) and expert technical recruiter. Your task is to evaluate the resume strictly against the target role and job description (if provided). Calculate a realistic ATS match score (0-100) based on keyword matching against the JD, measurable achievements, action verbs, and proper formatting. Provide actionable feedback to improve the resume."
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
                "strengths": [],
                "weaknesses": [],
                "missing_skills": [],
                "recommended_certifications": [],
                "actionable_improvements": [],
                "bullet_point_rewrites": [],
                "structured_experience": []
            })
        }

def generate_cover_letter(parsed_data: dict, raw_text: str, job_description: str, target_role: str = None) -> str:
    redacted_text = redact_pii(raw_text, parsed_data)
    
    # Redact PII from the parsed_data dict itself before sending to API
    redacted_parsed_data = parsed_data.copy()
    if redacted_parsed_data.get("name"):
        redacted_parsed_data["name"] = "[REDACTED NAME]"
    if redacted_parsed_data.get("email"):
        redacted_parsed_data["email"] = "[REDACTED EMAIL]"
    if redacted_parsed_data.get("phone"):
        redacted_parsed_data["phone"] = "[REDACTED PHONE]"
        
    role_context = f"The candidate is applying for the role of: **{target_role}**." if target_role else "The candidate is applying for the job described below."
    jd_context = f"\n\nHere is the Job Description for the target role:\n{job_description}\n"
    
    prompt = f"""
    You are an expert career coach and professional cover letter writer.
    Write a compelling, professional, and ATS-optimized cover letter for the candidate based on their resume data and the provided job description.
    
    {role_context}{jd_context}
    
    Candidate's Parsed Resume Data: {redacted_parsed_data}
    Candidate's Raw Resume Text: {redacted_text}
    
    Guidelines:
    1. Do not invent any experience, skills, or education that are not explicitly stated or strongly implied by the candidate's resume.
    2. Bridge the gap between the candidate's skills/experience and the specific requirements mentioned in the Job Description.
    3. Use a confident, professional, and engaging tone.
    4. Format the output as plain text with paragraphs. Do not include a header block with addresses (we will generate that in the PDF).
    5. Start directly with the salutation (e.g., "Dear Hiring Manager," or "To the Hiring Team,").
    6. Conclude with a professional sign-off (e.g., "Sincerely," followed by the candidate's name or a placeholder if redacted).
    7. Do NOT include markdown formatting like bolding (**) in the final text since this will be rendered directly to a PDF text block.
    """
    
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.4,
            )
        )
        return response.text
    except Exception as e:
        return f"Error generating cover letter: {str(e)}"
