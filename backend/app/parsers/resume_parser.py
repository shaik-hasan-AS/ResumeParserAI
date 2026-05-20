import pdfplumber
import spacy
import re
from io import BytesIO

# Load spacy model
nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def parse_resume_text(text: str) -> dict:
    # A very basic heuristic parser for the MVP
    doc = nlp(text)
    
    # Basic email regex
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    email = email_match.group(0) if email_match else None
    
    # Basic phone regex
    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else None
    
    # Improved Name Extraction
    name = None
    
    invalid_name_keywords = {
        "resume", "cv", "curriculum vitae", "email", "phone", "address",
        "developer", "engineer", "manager", "professional", "summary", "profile",
        "experience", "education", "skills", "portfolio", "github", "linkedin"
    }

    lines = [line.strip() for line in text.split('\n') if line.strip()]
    for line in lines[:15]:
        # Skip lines that are too long to be a name
        if len(line) > 50 or len(line.split()) > 5:
            continue
            
        # Check if line contains contact info or URLs
        if (email and email in line) or (phone and phone in line) or "linkedin.com" in line.lower() or "github.com" in line.lower() or "@" in line:
            continue
            
        # Check if it contains invalid keywords
        lower_line = line.lower()
        if any(keyword in lower_line.split() for keyword in invalid_name_keywords):
            continue
            
        # If it passes all filters and has 1-4 words of mostly alphabetic characters
        words = line.split()
        if 1 <= len(words) <= 4 and all(re.match(r"^[A-Za-z\.\-']+,?$", w) for w in words):
            name = line
            break
            
    # Fallback to Spacy NER if the heuristic didn't find anything
    if not name:
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                name = ent.text
                break
            
    # Naive skills extraction
    common_skills = ["Python", "React", "SQL", "JavaScript", "Next.js", "FastAPI", "C++", "Java", "Docker", "AWS", "Node.js", "Typescript", "Tailwind"]
    found_skills = [skill for skill in common_skills if skill.lower() in text.lower()]
    
    # Basic section extraction heuristic
    experience_section = ""
    education_section = ""
    current_section = None
    
    exp_keywords = {"experience", "work experience", "employment history", "professional experience"}
    edu_keywords = {"education", "academic background", "academic history"}
    
    # Very basic boundary detection
    for line in lines:
        lower_line = line.strip().lower()
        # If the line is short, it might be a header
        if len(lower_line) < 40:
            if any(k == lower_line for k in exp_keywords):
                current_section = "experience"
                continue
            elif any(k == lower_line for k in edu_keywords):
                current_section = "education"
                continue
            # Some other section header like "skills", "projects" might reset it
            elif lower_line in {"skills", "projects", "certifications", "summary", "profile", "languages"}:
                current_section = None
                continue
                
        if current_section == "experience":
            experience_section += line + "\n"
        elif current_section == "education":
            education_section += line + "\n"
    
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": found_skills,
        "experience": experience_section.strip() if experience_section else None,
        "education": education_section.strip() if education_section else None,
        "raw_text_length": len(text)
    }
