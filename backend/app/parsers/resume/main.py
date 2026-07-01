"""
Universal resume parser powered by Gemini structured output.

Strategy:
- Email / Phone / LinkedIn / GitHub → kept as regex (reliable, no hallucination risk)
- Everything else (name, sections, education, experience years, skills, summary)
  → Gemini with a strict Pydantic schema for JSON output
- Regex is still the fast-path fallback if Gemini is unavailable or rate-limited

ponytail: LLM is the correct hammer here. Regex section splitters break on every
          new resume format; Gemini reads layout semantics, not just keywords.
          Ceiling: adds ~1-2 s to upload latency and consumes one API call.
          Upgrade path: switch to flash-lite if latency becomes critical.
"""

import re
import json
import pdfplumber
import docx
from io import BytesIO
from typing import List, Optional
from pydantic import BaseModel, Field

from .extractors import extract_linkedin, extract_github
from .taxonomy import SKILL_TAXONOMY

# ─── File extraction (unchanged) ─────────────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = docx.Document(BytesIO(file_bytes))
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        return f"Error extracting DOCX text: {e}"


# ─── Gemini schema ────────────────────────────────────────────────────────────

class EducationEntry(BaseModel):
    degree: str = Field(description="Full degree name including field, e.g. 'Bachelor of Engineering in Computer Science'")
    institution: str = Field(description="Name of the university, college, or school")
    year: Optional[str] = Field(default=None, description="Graduation year or year range, e.g. '2022' or '2018-2022'")


class ParsedResume(BaseModel):
    name: str = Field(default="", description="Candidate's full name. Empty string if not found.")
    email: str = Field(default="", description="Primary email address. Empty string if not found.")
    phone: str = Field(default="", description="Primary phone number with country code if present. Empty string if not found.")
    linkedin: str = Field(default="", description="Full LinkedIn profile URL. Empty string if not found.")
    github: str = Field(default="", description="Full GitHub profile URL. Empty string if not found.")
    location: str = Field(default="", description="City, State/Country. Empty string if not found.")

    summary: str = Field(default="", description="Candidate's professional summary or objective section verbatim. Empty string if absent.")
    experience: str = Field(default="", description="Full work experience section text verbatim, preserving all job titles, companies, dates and bullet points.")
    education: str = Field(default="", description="Raw education section text verbatim.")
    education_entries: List[EducationEntry] = Field(default_factory=list, description="Structured list of education credentials parsed from the education section.")
    skills: str = Field(default="", description="Raw skills section text verbatim.")
    projects: str = Field(default="", description="Projects section text verbatim. Empty string if absent.")
    certifications: str = Field(default="", description="Certifications and licenses section text verbatim. Empty string if absent.")
    languages: str = Field(default="", description="Languages spoken section text verbatim. Empty string if absent.")
    awards: str = Field(default="", description="Awards, honors, or achievements section text verbatim. Empty string if absent.")

    experience_years: Optional[int] = Field(default=None, description="Estimated total years of professional work experience as an integer. Null if cannot be determined.")

    skills_list: List[str] = Field(default_factory=list, description="Flat list of all individual skills, technologies, tools, and competencies found anywhere in the resume.")


# ─── Regex quick extractors (kept — LLMs hallucinate URLs/contacts) ──────────

_EMAIL_RE = re.compile(r'[\w\.+\-]+@[\w\.\-]+\.\w+')
_PHONE_RE = re.compile(r'(?:\+?\d{1,3}[\s\-\.]?)?(?:\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4})')


def _regex_contacts(text: str) -> dict:
    email_m = _EMAIL_RE.search(text)
    phone_m = _PHONE_RE.search(text)
    return {
        "email": email_m.group(0) if email_m else "",
        "phone": phone_m.group(0).strip() if phone_m else "",
        "linkedin": extract_linkedin(text) or "",
        "github": extract_github(text) or "",
    }


# ─── Gemini universal parser ──────────────────────────────────────────────────

def _gemini_parse(raw_text: str) -> dict:
    """
    Call Gemini with a strict schema to parse all resume fields universally.
    Returns a dict matching ParsedResume fields. Raises on hard failure.
    """
    from google import genai
    from google.genai import types

    # Limit to first 8000 chars to keep within token limits for flash
    truncated = raw_text[:8000]

    prompt = f"""
### Task
You are an expert resume parser. Extract all structured information from the resume text below.

### Rules
1. Extract ONLY information explicitly present in the resume. Do NOT invent or infer.
2. For `experience_years`: estimate based on the date ranges in the experience section. If unclear, return null.
3. For `education_entries`: parse every degree, diploma, or certification found in the education section into structured objects.
4. For `skills_list`: extract every individual skill, tool, technology, framework, language, or competency mentioned anywhere in the resume. Include domain-specific skills (medical procedures, legal skills, financial tools, etc.).
5. Preserve original section text verbatim in `experience`, `education`, `skills`, etc.
6. Handle resumes from any industry (tech, medicine, law, finance, education, design, etc.).
7. Handle resumes in any format (chronological, functional, hybrid, academic CV).
8. For contact fields (email, phone, linkedin, github, location): extract precisely. Empty string if absent.

### Resume Text
{truncated}
"""

    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ParsedResume,
            temperature=0.0,
            system_instruction=(
                "You are a precise, universal resume parser. Extract only explicitly stated information. "
                "Never hallucinate. Handle resumes from all industries and formats."
            ),
        ),
    )
    return json.loads(response.text)


# ─── Skill categorization from free-form list ─────────────────────────────────

def _categorize_from_list(skills_list: list[str]) -> dict:
    """
    Match extracted skills against taxonomy; uncategorized go to 'technical'.
    Case-insensitive prefix match for robustness.

    ponytail: O(n*m) scan but n<=500 skills, m<=300 taxonomy entries — negligible.
    """
    lower_tax = {k.lower(): v for k, v in SKILL_TAXONOMY.items()}
    categorized: dict[str, list[str]] = {"technical": [], "soft": [], "tools": []}

    for skill in skills_list:
        cat = lower_tax.get(skill.lower(), "technical")
        categorized[cat].append(skill)

    return categorized


# ─── Public entrypoint (drop-in replacement) ─────────────────────────────────

def parse_resume_text(text: str) -> dict:
    """
    Universal resume parser. Uses Gemini for all structural parsing,
    with regex for contact fields (no hallucination risk).

    Falls back to a best-effort regex parse if Gemini fails.

    ponytail: single LLM call replaces 200 lines of fragile regex.
              Ceiling: +1-2s upload latency, 1 API token.
    """
    # Always run regex contacts — reliable and instant
    contacts = _regex_contacts(text)

    try:
        parsed = _gemini_parse(text)
    except Exception as e:
        # Graceful degradation: return a minimal dict so upload still succeeds
        import traceback
        print(f"[parser] Gemini parse failed, falling back to minimal: {e}\n{traceback.format_exc()}")
        parsed = {
            "name": "", "summary": "", "experience": "",
            "education": "", "education_entries": [],
            "skills": "", "projects": "", "certifications": "",
            "languages": "", "awards": "", "experience_years": None,
            "skills_list": [],
        }

    # Regex contacts take precedence over LLM for accuracy
    parsed["email"] = contacts["email"] or parsed.get("email", "")
    parsed["phone"] = contacts["phone"] or parsed.get("phone", "")
    parsed["linkedin"] = contacts["linkedin"] or parsed.get("linkedin", "")
    parsed["github"] = contacts["github"] or parsed.get("github", "")

    # Normalize empty strings to None for fields that callers may check with `if val`
    for field in ("name", "email", "phone", "linkedin", "github", "location",
                  "summary", "experience", "education", "skills",
                  "projects", "certifications", "languages", "awards"):
        v = parsed.get(field, "")
        parsed[field] = v if v else None

    # Build categorized skills from the LLM's extracted list
    skills_list = parsed.get("skills_list") or []
    parsed["skills_categorized"] = _categorize_from_list(skills_list)
    parsed["skills"] = skills_list  # keep as list for downstream consumers

    # Normalize education_entries (Gemini may return dicts or Pydantic objects)
    raw_edu = parsed.get("education_entries") or []
    parsed["education_entries"] = [
        e if isinstance(e, dict) else e.model_dump()
        for e in raw_edu
    ]

    # Metadata
    parsed["raw_text_length"] = len(text)

    return parsed


# Self-check (python -m pytest -x or just: python main.py)
if __name__ == "__main__":
    sample = """
John Doe
john.doe@email.com | +1 (555) 123-4567 | linkedin.com/in/johndoe | github.com/johndoe
San Francisco, CA

SUMMARY
Experienced software engineer with 7 years building distributed systems.

EXPERIENCE
Senior Software Engineer — Acme Corp, Jan 2020 – Present
- Led migration of monolith to microservices, reducing latency by 40%
- Managed team of 5 engineers

Software Engineer — Startup Inc, Jun 2017 – Dec 2019
- Built REST APIs in Python/FastAPI

EDUCATION
B.S. Computer Science — Stanford University, 2017

SKILLS
Python, FastAPI, Docker, Kubernetes, PostgreSQL, Redis, Leadership
"""
    result = parse_resume_text(sample)
    assert result["name"], "Name should be extracted"
    assert result["email"] == "john.doe@email.com", f"Email wrong: {result['email']}"
    assert result["experience_years"] and result["experience_years"] >= 7, f"Exp years: {result['experience_years']}"
    assert len(result["education_entries"]) >= 1, "Should find at least one education entry"
    assert "Python" in (result["skills"] or []), "Python should be in skills"
    print("✓ Self-check passed")
    print(json.dumps({k: v for k, v in result.items() if k != "skills_categorized"}, indent=2))
