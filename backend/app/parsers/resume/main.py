import spacy
import re
import pdfplumber
import docx
from io import BytesIO

from .taxonomy import SKILL_TAXONOMY, categorize_skills
from .extractors import extract_linkedin, extract_github, extract_location
from .education import parse_education_entries, compute_experience_years

# Load spacy model
nlp = spacy.load("en_core_web_sm")

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

def parse_resume_text(text: str) -> dict:
    doc = nlp(text)

    # ── Email ────────────────────────────────────────────────────────────────
    email_match = re.search(r'[\w\.\+\-]+@[\w\.\-]+\.\w+', text)
    email = email_match.group(0) if email_match else None

    # ── Phone ────────────────────────────────────────────────────────────────
    phone_match = re.search(
        r'(?:\+?\d{1,3}[\s\-\.]?)?(?:\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4})',
        text
    )
    phone = phone_match.group(0).strip() if phone_match else None

    # ── LinkedIn / GitHub / Location ─────────────────────────────────────────
    linkedin = extract_linkedin(text)
    github = extract_github(text)
    location = extract_location(text, doc)

    # ── Name ─────────────────────────────────────────────────────────────────
    name = None
    invalid_name_keywords = {
        "resume", "cv", "curriculum vitae", "email", "phone", "address",
        "developer", "engineer", "manager", "professional", "summary", "profile",
        "experience", "education", "skills", "portfolio", "github", "linkedin",
        "nurse", "accountant", "teacher", "consultant", "analyst", "director",
        "executive", "assistant", "specialist", "coordinator", "designer",
        "artist", "writer", "publications", "references", "hobbies",
        "activities", "honors", "awards", "volunteer", "certifications",
        "licenses", "projects", "languages"
    }
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    for line in lines[:15]:
        if len(line) > 50 or len(line.split()) > 5:
            continue
        if (email and email in line) or (phone and phone in line) \
                or "linkedin.com" in line.lower() or "github.com" in line.lower() \
                or "@" in line:
            continue
        lower_line = line.lower()
        if any(keyword in lower_line.split() for keyword in invalid_name_keywords):
            continue
        words = line.split()
        if 1 <= len(words) <= 4 and all(re.match(r"^[A-Za-z\.\-']+,?$", w) for w in words):
            name = line
            break
    if not name:
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                name = ent.text
                break

    # ── Skills ───────────────────────────────────────────────────────────────
    all_skills = list(SKILL_TAXONOMY.keys())
    found_skills = []
    text_lower = text.lower()
    for skill in all_skills:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)

    skills_categorized = categorize_skills(found_skills)

    # ── Section extraction ───────────────────────────────────────────────────
    experience_section = ""
    education_section = ""
    summary_section = ""
    projects_section = ""
    certifications_section = ""
    languages_section = ""
    awards_section = ""
    
    current_section = None

    exp_keywords = {
        "experience", "work experience", "employment history", "professional experience",
        "clinical experience", "teaching experience", "relevant experience", "work history",
        "research guidance"
    }
    edu_keywords = {
        "education", "academic background", "academic history", "qualifications", "training",
        "labview academy"
    }
    summary_keywords = {
        "summary", "profile", "professional summary", "professional profile", "objective", "career objective"
    }
    projects_keywords = {
        "projects", "academic projects", "personal projects", "open source projects", "projects developed at crescent engineering college"
    }
    certs_keywords = {
        "certifications", "licenses", "certifications & licenses", "licenses & certifications", "certifications & courses", "courses"
    }
    lang_keywords = {
        "languages"
    }
    awards_keywords = {
        "awards", "honors", "awards & honors", "honors & awards", "achievements"
    }
    
    reset_keywords = {
        "skills", "publications", "affiliations", "volunteer experience", "leadership",
        "references", "activities", "interests",
        "most proud of", "strengths", "citations", "professional society memberships",
        "fundings", "patent",
        "guest lectures delivered", "collaborations", "journals reviewed", "accreditation"
    }

    for line in lines:
        lower_line = line.strip().lower()
        if len(lower_line) < 50:
            if any(k == lower_line for k in exp_keywords):
                current_section = "experience"
                continue
            elif any(k == lower_line for k in edu_keywords):
                current_section = "education"
                continue
            elif any(k == lower_line for k in summary_keywords):
                current_section = "summary"
                continue
            elif any(k == lower_line for k in projects_keywords):
                current_section = "projects"
                continue
            elif any(k == lower_line for k in certs_keywords):
                current_section = "certifications"
                continue
            elif any(k == lower_line for k in lang_keywords):
                current_section = "languages"
                continue
            elif any(k == lower_line for k in awards_keywords):
                current_section = "awards"
                continue
            elif lower_line in reset_keywords:
                current_section = None
                continue
        if current_section == "experience":
            experience_section += line + "\n"
        elif current_section == "education":
            education_section += line + "\n"
        elif current_section == "summary":
            summary_section += line + "\n"
        elif current_section == "projects":
            projects_section += line + "\n"
        elif current_section == "certifications":
            certifications_section += line + "\n"
        elif current_section == "languages":
            languages_section += line + "\n"
        elif current_section == "awards":
            awards_section += line + "\n"

    education_section = education_section.strip() if education_section else None
    experience_section = experience_section.strip() if experience_section else None
    summary_section = summary_section.strip() if summary_section else None
    projects_section = projects_section.strip() if projects_section else None
    certifications_section = certifications_section.strip() if certifications_section else None
    languages_section = languages_section.strip() if languages_section else None
    awards_section = awards_section.strip() if awards_section else None

    # ── Structured education entries ─────────────────────────────────────────
    education_entries = parse_education_entries(education_section or "")

    # ── Experience years ─────────────────────────────────────────────────────
    experience_years = compute_experience_years(experience_section or "")

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
        "location": location,
        "skills": found_skills,
        "skills_categorized": skills_categorized,
        "experience_years": experience_years,
        "education_entries": education_entries,
        "experience": experience_section,
        "education": education_section,
        "summary": summary_section,
        "projects": projects_section,
        "certifications": certifications_section,
        "languages": languages_section,
        "awards": awards_section,
        "raw_text_length": len(text),
    }
