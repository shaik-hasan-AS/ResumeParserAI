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
    professional_summary: str = Field(description="A 2-3 sentence professional summary tailored to the target role, written in the third person or implied first person (e.g., 'Results-driven Software Engineer...'), suitable to be placed at the very top of the candidate's resume. Do not use bullet points.")
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
    
    role_context = f"Target Role: {target_role}" if target_role else "Target Role: General (not specified)"
    jd_context = f"\nTarget Job Description:\n{job_description}" if job_description else ""
    
    prompt = f"""
### System Instruction
You are an expert recruiter and senior Applicant Tracking System (ATS) auditor.
Evaluate the candidate's resume details and calculate an accurate, realistic ATS match score.
If a Job Description is provided, calculate the score based on keyword match, requirement coverage, and role relevance. If no Job Description is provided, evaluate based on general professional standards.

### Context
{role_context}
{jd_context}

### Candidate Parsed Profile
{json.dumps(redacted_parsed_data, indent=2)}

### Candidate Raw Resume Text
{redacted_text}

### Instructions
1. Analyze key strengths and weaknesses in the candidate's profile.
2. Formulate 3-5 recommended certifications and concrete actionable steps to improve the resume.
3. Suggest 3 impact-driven bullet point rewrites using the STAR method (Situation, Task, Action, Result) with metrics.
4. Extract the candidate's structured experience cleanly, optimizing experience bullets without changing factual details.
5. Generate a powerful professional summary tailored to the target role.
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
                "professional_summary": "",
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
        
    role_context = f"Target Role: {target_role}" if target_role else "Target Role: General (not specified)"
    jd_context = f"\nTarget Job Description:\n{job_description}"
    
    prompt = f"""
### System Instruction
You are an expert career coach and elite professional cover letter writer.
Draft an ATS-optimized, high-impact cover letter.

### Context
{role_context}
{jd_context}

### Candidate Parsed Profile
{json.dumps(redacted_parsed_data, indent=2)}

### Candidate Raw Resume Text
{redacted_text}

### Instructions
1. Highlight how the candidate's skills and accomplishments directly align with the Job Description requirements.
2. Bridge experience gaps by framing transferable skills positively.
3. Maintain a highly confident, professional, and industry-appropriate tone.
4. Output the letter as clean plain text paragraphs. Do not write contact addresses in the header (the PDF generator takes care of that).
5. Start directly with an appropriate salutation (e.g., "Dear Hiring Manager," or "To the Hiring Team,").
6. Conclude with a professional signature (e.g., "Sincerely,", followed by "[REDACTED NAME]" or candidate's name).
7. CRITICAL: Do NOT output any markdown syntax (such as bolding '**', headers '#', or bullet points) in the content body. It must be 100% clean plain text for direct PDF injection.
"""
    
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.4,
            )
        )
        return response.text
    except Exception as e:
        return f"Error generating cover letter: {str(e)}"

def rewrite_text(text: str, context: str = None) -> str:
    prompt = f"""
### System Instruction
You are an expert resume writer and career coach.
Rewrite the target text into a highly professional, ATS-optimized, and impactful format.
Make it concise, action-oriented, and tailored to the context provided. Do not invent any new facts.

### Context / Placement
{context or 'Resume element / Bullet point'}

### Target Text to Rewrite
"{text}"

### Instructions
1. Elevate the language using strong, professional action verbs.
2. Focus on readability and direct professional impact.
3. Return ONLY the rewritten text itself. Do not include any explanations, surrounding quotes, preamble, or notes.
"""
    
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
            )
        )
        return response.text.strip()
    except Exception as e:
        return f"Error rewriting text: {str(e)}"

class MockInterviewQuestion(BaseModel):
    question: str = Field(description="The interview question.")
    type: str = Field(description="The type of question (e.g., technical, behavioral, situational).")
    expected_answer_hints: List[str] = Field(description="Key points the candidate should hit in their answer.")

class MockInterviewResponse(BaseModel):
    questions: List[MockInterviewQuestion] = Field(description="List of 5 to 7 mock interview questions.")

def generate_mock_interview(parsed_data: dict, raw_text: str, target_role: str = None, job_description: str = None) -> str:
    redacted_text = redact_pii(raw_text, parsed_data)
    
    # Redact PII from the parsed_data dict itself before sending to API
    redacted_parsed_data = parsed_data.copy()
    if redacted_parsed_data.get("name"):
        redacted_parsed_data["name"] = "[REDACTED NAME]"
    if redacted_parsed_data.get("email"):
        redacted_parsed_data["email"] = "[REDACTED EMAIL]"
    if redacted_parsed_data.get("phone"):
        redacted_parsed_data["phone"] = "[REDACTED PHONE]"
        
    role_context = f"Target Role: {target_role}" if target_role else "Target Role: General (not specified)"
    jd_context = f"\nTarget Job Description:\n{job_description}" if job_description else ""
    
    prompt = f"""
### System Instruction
You are an expert technical interviewer and seasoned hiring manager.
Generate 5 to 7 highly tailored, challenging mock interview questions.

### Context
{role_context}
{jd_context}

### Candidate Parsed Profile
{json.dumps(redacted_parsed_data, indent=2)}

### Candidate Raw Resume Text
{redacted_text}

### Instructions
1. Output a balanced mix of technical, behavioral, and situational questions.
2. Align questions with their specific field (e.g. system architecture/performance for tech, clinical protocols/patient care for medicine/health).
3. Tailor questions to probe both their highlighted areas of strength and potential experience gaps relative to the job requirements.
4. For each question, provide 2-3 brief "expected answer hints" (e.g. key technical keywords or STAR structural points) they should hit.
"""
    
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MockInterviewResponse,
                temperature=0.4,
            )
        )
        return response.text
    except Exception as e:
        return json.dumps({"questions": [{"question": f"Error generating interview: {str(e)}", "type": "error", "expected_answer_hints": []}]})

class CandidateEvaluation(BaseModel):
    match_score: int = Field(description="Match score out of 100 based on the candidate's fit for the job description.")
    match_summary: str = Field(description="A 2-3 sentence summary explaining why the candidate is or isn't a good fit, based on their skills and the job requirements.")

def evaluate_candidate_fit(parsed_data: dict, job_description: str) -> dict:
    # Redact PII to avoid bias or privacy issues
    redacted_parsed_data = parsed_data.copy()
    if redacted_parsed_data.get("name"):
        redacted_parsed_data["name"] = "[REDACTED NAME]"
    if redacted_parsed_data.get("email"):
        redacted_parsed_data["email"] = "[REDACTED EMAIL]"
    if redacted_parsed_data.get("phone"):
        redacted_parsed_data["phone"] = "[REDACTED PHONE]"

    prompt = f"""
### System Instruction
You are an expert technical recruiter and senior hiring manager.
Evaluate the candidate's parsed resume details against the job requirements.

### Job Description
{job_description}

### Candidate Parsed Profile
{json.dumps(redacted_parsed_data, indent=2)}

### Instructions
1. Calculate a realistic compatibility score out of 100 based on core skills, level of experience, and role alignment.
2. Provide a concise 2-3 sentence professional summary explaining your matching decision, citing key strengths or missing requirements.
"""

    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CandidateEvaluation,
                temperature=0.2,
            )
        )
        parsed_response = json.loads(response.text)
        return {
            "match_score": parsed_response.get("match_score", 0),
            "match_summary": parsed_response.get("match_summary", "Evaluation failed.")
        }
    except Exception as e:
        return {
            "match_score": 0,
            "match_summary": f"Error evaluating candidate: {str(e)}"
        }

def generate_outreach_email(parsed_data: dict, raw_text: str, job_description: str, target_role: str, email_type: str) -> str:
    redacted_text = redact_pii(raw_text, parsed_data)
    
    redacted_parsed_data = parsed_data.copy()
    if redacted_parsed_data.get("email"):
        redacted_parsed_data["email"] = "[REDACTED EMAIL]"
    if redacted_parsed_data.get("phone"):
        redacted_parsed_data["phone"] = "[REDACTED PHONE]"

    # If email type is interview or initial_contact, sound excited. If rejection, be polite.
    tone_instruction = "professional, excited, and welcoming"
    if email_type == "rejection":
        tone_instruction = "professional, polite, and respectful"
        
    prompt = f"""
### System Instruction
You are an expert recruiter. Write a professional outreach or status update email to the candidate.

### Context
- Candidate Name: {parsed_data.get('name', 'Candidate')}
- Target Role: {target_role}
- Email Type: {email_type.upper().replace('_', ' ')}
- Email Tone: {tone_instruction}

### Job Description
{job_description or 'No specific description provided.'}

### Candidate Parsed Profile
{json.dumps(redacted_parsed_data, indent=2)}

### Instructions
1. For outreach/interview emails: Highlight 1-2 impressive matching skills or experience bullets from their resume that show alignment with the job description.
2. For rejection emails: Be respectful, polite, encouraging, and brief.
3. Output ONLY the subject line starting with "Subject: " followed by the email body.
4. Do not prefix with notes, preamble, or comments.
5. Use placeholders like [Insert Company Name] or [Insert Calendar Link] where context needs insertion.
"""

    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.5,
            )
        )
        return response.text.strip()
    except Exception as e:
        return f"Subject: Error Generating Email\n\nError: {str(e)}"


# ── Audio transcription ────────────────────────────────────────────────────────

def transcribe_audio(file_bytes: bytes, mime_type: str = "audio/mpeg") -> str:
    """Upload audio bytes to Gemini Files API and return a structured transcript."""
    import tempfile, os
    # Write to a temp file so the SDK can upload it
    suffix = ".mp3"
    if "webm" in mime_type: suffix = ".webm"
    elif "wav" in mime_type: suffix = ".wav"
    elif "m4a" in mime_type or "mp4" in mime_type: suffix = ".m4a"
    elif "ogg" in mime_type: suffix = ".ogg"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        client = genai.Client()
        uploaded = client.files.upload(file=tmp_path)
        prompt_instruction = """
### System Instruction
You are a highly accurate audio transcriber and structured data parser.
Analyze the audio recording of the candidate talking about their profile.

### Task
1. Generate a verbatim, clean transcription of the audio content.
2. Extract all professional details mentioned (job titles, companies, dates, achievements, skills, education, projects, certifications).
3. Output the results strictly as a JSON object matching the requested schema (no markdown formatting blocks, preamble, or notes).

### Output Schema Shape
{
  "transcript": "Verbatim transcript of the voice clip...",
  "extracted": {
    "experience": [
      {
        "job_title": "...",
        "company": "...",
        "dates": "...",
        "bullet_points": ["..."]
      }
    ],
    "skills": ["..."],
    "education": ["..."],
    "projects": "...",
    "certifications": "...",
    "summary": "..."
  }
}
"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt_instruction, uploaded],
            config=types.GenerateContentConfig(temperature=0.1),
        )
        return response.text
    finally:
        os.unlink(tmp_path)


class EnhancedResumeData(BaseModel):
    name: str = Field(description="Candidate's full name from existing resume data.")
    email: str = Field(description="Candidate's email.")
    phone: str = Field(description="Candidate's phone number.")
    linkedin: str = Field(description="LinkedIn URL if available.")
    github: str = Field(description="GitHub or portfolio URL if available.")
    location: str = Field(description="Candidate's location.")
    summary: str = Field(description="A powerful 2-3 sentence professional summary combining resume and audio info.")
    structured_experience: List[ExperienceEntry] = Field(
        description="Complete, optimized work experience merging resume and audio. Rewrite all bullet points to be impact-driven and ATS-optimized."
    )
    skills_categorized: dict = Field(
        description="Skills object with keys 'technical', 'soft', 'tools' each containing a list of strings. Merge skills from both resume and audio."
    )
    education: str = Field(description="Education section text, preserved from original resume.")
    projects: str = Field(description="Projects section, merged from resume and audio if applicable.")
    certifications: str = Field(description="Certifications from resume and audio.")


def enhance_resume_with_audio(parsed_data: dict, raw_text: str, audio_transcript: str) -> dict:
    """Merge existing parsed resume data with audio transcript and return an enhanced parsed_json."""
    # Redact PII before sending
    redacted = parsed_data.copy()
    for field in ("name", "email", "phone"):
        if redacted.get(field):
            redacted[field] = f"[CANDIDATE_{field.upper()}]"

    prompt = f"""
### System Instruction
You are an elite professional resume writer and career coach.
Your task is to merge existing resume details with dynamic voice transcripts into a single optimized resume.

### Candidate Existing Profile
{json.dumps(redacted, indent=2)}

### Candidate Voice Transcript / Explanations
{audio_transcript}

### Instructions
1. Merge experience entries from both sources seamlessly, avoiding any duplicate listings.
2. Rewrite all work experience bullet points to begin with strong, industry-appropriate action verbs and include metrics/measurable outcomes.
3. Combine, filter, and correctly categorize all skills into 'technical', 'soft', and 'tools'.
4. Draft an impactful professional summary (2-3 sentences) summarizing their combined experience.
5. Retain original contact information placeholders exactly.
"""

    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EnhancedResumeData,
                temperature=0.2,
            ),
        )
        enhanced = json.loads(response.text)
        # Restore real PII from original parsed_data
        for field in ("name", "email", "phone", "linkedin", "github", "location"):
            if parsed_data.get(field):
                enhanced[field] = parsed_data[field]
        # Carry over fields the schema doesn't touch
        for field in ("education_entries", "experience_years", "section_order", "visible_sections", "section_labels"):
            if parsed_data.get(field) is not None:
                enhanced.setdefault(field, parsed_data[field])
        return enhanced
    except Exception as e:
        return {"error": str(e), **parsed_data}


class InterviewAnswerEvaluation(BaseModel):
    feedback: str = Field(description="Constructive critique of the answer. Highlight strengths, what was missed, and structural improvements.")
    score: int = Field(description="Score out of 10 for the quality of the answer relative to expectations.")
    better_phrasing: str = Field(description="A highly optimized rewrite of the candidate's answer using proper structure (e.g. STAR method).")


def evaluate_interview_answer(question: str, expected_hints: List[str], answer_text: str) -> dict:
    """Evaluate candidate's interview answer using Gemini."""
    prompt = f"""
### System Instruction
You are an expert technical and behavioral interviewer evaluating a candidate's response to an interview question.
Analyze the response objectively and provide constructive feedback.

### Interview Question
"{question}"

### Expected Key Points / Hints
{json.dumps(expected_hints, indent=2)}

### Candidate Transcription
"{answer_text}"

### Instructions
1. Provide detailed constructive feedback highlighting strengths, missed opportunities, and structural points.
2. Calculate a realistic score out of 10.
3. Rewrite the response using the STAR technique (Situation, Task, Action, Result) to demonstrate optimal phrasing.
"""
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=InterviewAnswerEvaluation,
                temperature=0.2,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        return {
            "feedback": f"Failed to evaluate answer: {str(e)}",
            "score": 0,
            "better_phrasing": "N/A"
        }


class ATSMatchReport(BaseModel):
    match_score: int = Field(description="Match score out of 100 based on keyword overlap and role relevance.")
    matched_keywords: List[str] = Field(description="Important skill keywords present in both resume and Job Description.")
    missing_keywords: List[str] = Field(description="Skills or tool keywords found in the Job Description but missing on the resume.")
    suggested_bullet_fixes: List[str] = Field(description="3 draft bullet points candidates can add to their experience, incorporating missing keywords naturally based on their background.")


def evaluate_ats_match(parsed_data: dict, raw_text: str, job_description: str) -> dict:
    """Evaluate resume data against job description to provide match score, keyword details, and draft bullet fixes."""
    redacted_text = redact_pii(raw_text, parsed_data)
    redacted_parsed_data = parsed_data.copy()
    for field in ("name", "email", "phone", "linkedin", "github", "location"):
        if redacted_parsed_data.get(field):
            redacted_parsed_data[field] = "[REDACTED]"

    prompt = f"""
### System Instruction
You are an expert ATS (Applicant Tracking System) optimizer and professional resume auditor.
Analyze the candidate's resume against the Job Description.

### Job Description
{job_description}

### Candidate Parsed Profile
{json.dumps(redacted_parsed_data, indent=2)}

### Candidate Raw Resume Text
{redacted_text}

### Instructions
1. Calculate a realistic ATS compatibility score out of 100 based on keyword overlap, role alignment, and experience.
2. Identify core skill keywords present in both the resume and Job Description.
3. Identify major tool, technology, or domain keywords mentioned in the Job Description but missing from the resume.
4. Draft 3 high-impact experience bullet points incorporating the missing keywords naturally, tailored to the candidate's existing background.
"""
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ATSMatchReport,
                temperature=0.2,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        return {
            "match_score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "suggested_bullet_fixes": [f"Evaluation error: {str(e)}"]
        }


class SpeechSuggestionsReport(BaseModel):
    suggestions: List[str] = Field(description="3 tailored, industry-specific speech prompts suggesting what the candidate should talk about in their audio clip (e.g. key projects, technical stacks, or clinical procedures based on their exact profile).")


def generate_speech_suggestions(parsed_data: dict) -> dict:
    """Generate 3 industry-specific, tailored speech suggestions based on parsed resume experience to guide their audio recording."""
    redacted_data = parsed_data.copy()
    for field in ("name", "email", "phone", "linkedin", "github", "location"):
        if redacted_data.get(field):
            redacted_data[field] = "[REDACTED]"
            
    prompt = f"""
### System Instruction
You are an expert career coach and professional resume designer.
To ensure the voice recording is highly relevant to their field, generate exactly 3 tailored, industry-specific speech suggestions based on their resume profile.

For tech candidates, ask about system architecture, stack decisions, or performance metrics.
For medical/health candidates, ask about clinical procedures, patient volume, or care protocols.
For other fields, tailor it specifically to their core responsibilities.

### Candidate Parsed Profile
{json.dumps(redacted_data, indent=2)}

### Instructions
1. Generate exactly 3 highly actionable, customized speech suggestions to prompt them.
2. Provide tailored industry-specific prompts matching their specific sector.
"""
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SpeechSuggestionsReport,
                temperature=0.4,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Failed to generate speech suggestions: {e}")
        # Default fallback questions
        return {
            "suggestions": [
                "Explain what you did on your daily job role (technologies, day-to-day workflow, team size).",
                "Mention a specific challenge or feature you built, and describe the measurable outcome (e.g. improved API speeds by 30%).",
                "State any hidden skills, certifications, or tools you know that aren't on your resume."
            ]
        }
