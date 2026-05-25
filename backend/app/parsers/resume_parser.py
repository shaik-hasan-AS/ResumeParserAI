import pdfplumber
import spacy
import re
from io import BytesIO
from datetime import datetime

# Load spacy model
nlp = spacy.load("en_core_web_sm")

CURRENT_YEAR = datetime.now().year

# ---------------------------------------------------------------------------
# Skill taxonomy — every skill maps to one category
# ---------------------------------------------------------------------------
SKILL_TAXONOMY = {
    # ── Technical ────────────────────────────────────────────────────────────
    "Python": "technical", "React": "technical", "SQL": "technical",
    "JavaScript": "technical", "Next.js": "technical", "FastAPI": "technical",
    "C++": "technical", "Java": "technical", "Docker": "technical",
    "AWS": "technical", "Node.js": "technical", "TypeScript": "technical",
    "Machine Learning": "technical", "Data Analysis": "technical",
    "Azure": "technical", "GCP": "technical", "Kubernetes": "technical",
    "Git": "technical", "HTML": "technical", "CSS": "technical",
    "PHP": "technical", "Ruby": "technical", "Go": "technical",
    "Rust": "technical", "Swift": "technical", "Kotlin": "technical",
    "Angular": "technical", "Vue.js": "technical", "Django": "technical",
    "Flask": "technical", "Spring Boot": "technical", "Hibernate": "technical",
    "Express.js": "technical", "MongoDB": "technical", "PostgreSQL": "technical",
    "MySQL": "technical", "Redis": "technical", "Cassandra": "technical",
    "Oracle": "technical", "SQLite": "technical", "GraphQL": "technical",
    "REST APIs": "technical", "SOAP": "technical", "Microservices": "technical",
    "CI/CD": "technical", "Jenkins": "technical", "GitHub Actions": "technical",
    "GitLab CI": "technical", "Terraform": "technical", "Ansible": "technical",
    "Chef": "technical", "Puppet": "technical", "Linux": "technical",
    "Unix": "technical", "Bash": "technical", "PowerShell": "technical",
    "Data Science": "technical", "Data Visualization": "technical",
    "Pandas": "technical", "NumPy": "technical", "Scikit-learn": "technical",
    "TensorFlow": "technical", "PyTorch": "technical", "Keras": "technical",
    "Hadoop": "technical", "Spark": "technical", "Kafka": "technical",
    "Airflow": "technical", "Elasticsearch": "technical",

    # ── Tools ────────────────────────────────────────────────────────────────
    "Excel": "tools", "Tableau": "tools", "Power BI": "tools",
    "Salesforce": "tools", "QuickBooks": "tools", "Figma": "tools",
    "Sketch": "tools", "Photoshop": "tools", "Illustrator": "tools",
    "Adobe Creative Suite": "tools", "After Effects": "tools",
    "Premiere Pro": "tools", "Final Cut Pro": "tools", "Lightroom": "tools",
    "InDesign": "tools", "Google Analytics": "tools", "Google Ads": "tools",
    "Mailchimp": "tools", "Kibana": "tools", "Logstash": "tools",
    "Prometheus": "tools", "Grafana": "tools", "Jira": "tools",
    "Confluence": "tools", "Notion": "tools", "Slack": "tools",
    "Moodle": "tools", "Blackboard": "tools", "Canvas": "tools",

    # ── Soft ─────────────────────────────────────────────────────────────────
    "Project Management": "soft", "Agile": "soft", "Scrum": "soft",
    "Leadership": "soft", "Communication": "soft", "Public Speaking": "soft",
    "Problem Solving": "soft", "Teamwork": "soft", "Time Management": "soft",
    "Customer Service": "soft", "Critical Thinking": "soft",
    "Operations": "soft", "Event Planning": "soft", "Research": "soft",
    "Cross-functional Team Leadership": "soft", "Conflict Resolution": "soft",
    "Adaptability": "soft", "Empathy": "soft", "Creativity": "soft",
    "Emotional Intelligence": "soft", "Mentorship": "soft",
    "Training & Development": "soft", "Presentation Skills": "soft",
    "Analytical Skills": "soft", "Attention to Detail": "soft",
    "Organization": "soft", "Multitasking": "soft", "Stress Management": "soft",
    "Decision Making": "soft", "Strategic Thinking": "soft",
    "Innovation": "soft", "Resourcefulness": "soft",
    "Client Relations": "soft", "Stakeholder Management": "soft",
    "Bilingual": "soft", "Multilingual": "soft", "Negotiation": "soft",
    "Strategy": "soft", "Business Development": "soft",
    "Account Management": "soft", "Customer Success": "soft",
    "Market Research": "soft", "Competitor Analysis": "soft",
    "Strategic Planning": "soft", "Product Management": "soft",
    "Brand Management": "soft",

    # ── Tools (Marketing & Finance) ───────────────────────────────────────────
    "SEO": "tools", "SEM": "tools", "PPC": "tools",
    "Digital Marketing": "tools", "Social Media Management": "tools",
    "Email Marketing": "tools", "Financial Modeling": "tools",
    "Financial Analysis": "tools", "Accounting": "tools",
    "Budgeting": "tools", "Marketing": "tools", "Sales": "tools",
    "Lead Generation": "tools", "Data Entry": "tools",
    "CRM": "tools", "B2B": "tools", "B2C": "tools",
    "Cold Calling": "tools", "Lead Qualification": "tools",
    "Risk Management": "tools", "Investment Banking": "tools",
    "Equity Research": "tools", "Auditing": "tools",
    "IFRS": "tools", "GAAP": "tools",
    "Accounts Payable": "tools", "Accounts Receivable": "tools",
    "Payroll": "tools", "Taxation": "tools",
    "Contract Negotiation": "tools", "Supply Chain Management": "tools",
    "Logistics": "tools", "Inventory Management": "tools",
    "Procurement": "tools", "Vendor Management": "tools",
    "Quality Assurance": "tools", "Quality Control": "tools",
    "Six Sigma": "tools", "Lean Manufacturing": "tools",

    # ── Technical (Healthcare) ────────────────────────────────────────────────
    "Patient Care": "technical", "CPR": "technical", "EHR": "technical",
    "HIPAA": "technical", "BLS": "technical", "ACLS": "technical",
    "Triage": "technical", "Phlebotomy": "technical", "Nursing": "technical",
    "Medical Terminology": "technical", "EMR": "technical",
    "Vital Signs": "technical", "Infection Control": "technical",
    "Patient Assessment": "technical", "Medication Administration": "technical",
    "IV Therapy": "technical", "Wound Care": "technical",
    "Electronic Health Records": "technical", "Electronic Medical Records": "technical",
    "ICD-10": "tools", "CPT Coding": "tools", "Medical Billing": "tools",

    # ── Design ───────────────────────────────────────────────────────────────
    "UI/UX": "technical", "Graphic Design": "technical",
    "Wireframing": "technical", "Prototyping": "technical",
    "User Research": "technical", "Usability Testing": "technical",
    "Information Architecture": "technical", "Interaction Design": "technical",
    "Visual Design": "technical", "Typography": "tools",
    "Color Theory": "tools", "Branding": "tools",
    "Web Design": "technical", "Animation": "technical",
    "Motion Graphics": "technical", "Photography": "tools",
    "Video Editing": "tools", "Copywriting": "soft",
    "Content Creation": "soft", "Social Media Marketing": "tools",

    # ── Education/Legal ───────────────────────────────────────────────────────
    "Curriculum Development": "technical", "Lesson Planning": "soft",
    "Classroom Management": "soft", "Special Education": "technical",
    "E-Learning": "tools", "Instructional Design": "technical",
    "Corporate Training": "soft", "Legal Research": "technical",
    "Contract Drafting": "technical", "Litigation": "technical",
    "Corporate Law": "technical", "Intellectual Property": "technical",
    "Paralegal": "technical", "Notary Public": "technical",
    "Real Estate": "technical", "Property Management": "technical",
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_linkedin(text: str) -> str | None:
    """Extract a LinkedIn profile URL."""
    match = re.search(
        r'(?:https?://)?(?:www\.)?linkedin\.com/in/([A-Za-z0-9\-_%]+)/?',
        text, re.IGNORECASE
    )
    if match:
        return f"https://linkedin.com/in/{match.group(1)}"
    return None


def _extract_github(text: str) -> str | None:
    """Extract a GitHub profile URL."""
    match = re.search(
        r'(?:https?://)?(?:www\.)?github\.com/([A-Za-z0-9\-_]+)(?:/[^\s]*)?',
        text, re.IGNORECASE
    )
    if match:
        username = match.group(1)
        # Avoid false positives like github.com/actions or github.com/topics
        blocklist = {"actions", "features", "topics", "marketplace", "explore", "about"}
        if username.lower() not in blocklist:
            return f"https://github.com/{username}"
    return None


def _extract_location(text: str, doc) -> str | None:
    """Extract a location using spaCy GPE/LOC entities near the top of the doc."""
    # Only look at first ~500 chars to keep it near the header
    top_text = text[:600]
    top_doc = nlp(top_text)
    for ent in top_doc.ents:
        if ent.label_ in ("GPE", "LOC"):
            return ent.text
    # Fallback: look for "City, State" pattern
    match = re.search(
        r'\b([A-Z][a-z]+(?: [A-Z][a-z]+)*),\s*([A-Z]{2})\b',
        top_text
    )
    if match:
        return match.group(0)
    return None


DEGREE_PATTERNS = [
    r'Ph\.?D\.?(?:\s+in\s+[\w\s,&]+)?',
    r'Doctor(?:ate)?(?:\s+of\s+[\w\s,&]+)?',
    r'M\.?S\.?(?:\s+in\s+[\w\s,&]+)?',
    r'M\.?Sc\.?(?:\s+in\s+[\w\s,&]+)?',
    r'M\.?Tech\.?(?:\s+in\s+[\w\s,&]+)?',
    r'M\.?B\.?A\.?(?:\s+in\s+[\w\s,&]+)?',
    r'Master(?:\'s)?(?:\s+of\s+[\w\s,&]+)?',
    r'B\.?S\.?(?:\s+in\s+[\w\s,&]+)?',
    r'B\.?Sc\.?(?:\s+in\s+[\w\s,&]+)?',
    r'B\.?Tech\.?(?:\s+in\s+[\w\s,&]+)?',
    r'B\.?E\.?(?:\s+in\s+[\w\s,&]+)?',
    r'B\.?A\.?(?:\s+in\s+[\w\s,&]+)?',
    r'Bachelor(?:\'s)?(?:\s+of\s+[\w\s,&]+)?',
    r'Associate(?:\'s)?(?:\s+of\s+[\w\s,&]+)?',
    r'High School Diploma',
    r'Diploma(?:\s+in\s+[\w\s,&]+)?',
    r'Certificate(?:\s+in\s+[\w\s,&]+)?',
]
DEGREE_RE = re.compile('|'.join(DEGREE_PATTERNS), re.IGNORECASE)
YEAR_RE = re.compile(r'\b(19[89]\d|20[0-3]\d)\b')


def _parse_education_entries(education_text: str) -> list[dict]:
    """Parse raw education text into a list of {degree, institution, year} dicts."""
    if not education_text:
        return []

    entries = []
    lines = [l.strip() for l in education_text.split('\n') if l.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]
        degree_match = DEGREE_RE.search(line)

        if degree_match:
            degree = degree_match.group(0).strip()
            # Try to find year in current or next 3 lines
            year = None
            institution = None

            context_lines = lines[i:i+4]
            for cl in context_lines:
                ym = YEAR_RE.search(cl)
                if ym:
                    year = ym.group(0)
                    break

            # Institution: line after the degree line if it doesn't look like a year/date
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                if not DEGREE_RE.search(next_line) and not re.match(r'^\d{4}', next_line.strip()):
                    institution = next_line

            if year is None and institution and YEAR_RE.search(institution):
                year = YEAR_RE.search(institution).group(0)

            # Fallback: extract institution from same line after degree
            if not institution:
                after_degree = line[degree_match.end():].strip(" ,–-|")
                if after_degree and len(after_degree) > 3:
                    institution = after_degree

            entries.append({
                "degree": degree,
                "institution": institution or "Unknown Institution",
                "year": year,
            })

        i += 1

    # Deduplicate by degree
    seen = set()
    unique = []
    for e in entries:
        key = e["degree"].lower()
        if key not in seen:
            seen.add(key)
            unique.append(e)

    return unique


def _compute_experience_years(experience_text: str) -> int | None:
    """Estimate years of experience from year mentions in the experience section."""
    if not experience_text:
        return None
    years = [int(y) for y in YEAR_RE.findall(experience_text) if int(y) <= CURRENT_YEAR]
    if not years:
        return None
    earliest = min(years)
    latest = max(years)
    # Use the later of earliest or (latest from experience), bounded by now
    span = min(CURRENT_YEAR, latest) - earliest
    return max(0, span)


def _categorize_skills(found_skills: list[str]) -> dict:
    categorized = {"technical": [], "soft": [], "tools": []}
    for skill in found_skills:
        cat = SKILL_TAXONOMY.get(skill, "technical")
        categorized[cat].append(skill)
    return categorized


# ---------------------------------------------------------------------------
# Main parser
# ---------------------------------------------------------------------------

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
    linkedin = _extract_linkedin(text)
    github = _extract_github(text)
    location = _extract_location(text, doc)

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

    skills_categorized = _categorize_skills(found_skills)

    # ── Section extraction ───────────────────────────────────────────────────
    experience_section = ""
    education_section = ""
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
    reset_keywords = {
        "skills", "projects", "certifications", "summary", "profile", "languages",
        "publications", "affiliations", "volunteer experience", "leadership",
        "awards", "honors", "references", "activities", "interests", "licenses",
        "most proud of", "strengths", "citations", "professional society memberships",
        "fundings", "patent", "projects developed at crescent engineering college",
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
            elif lower_line in reset_keywords:
                current_section = None
                continue
        if current_section == "experience":
            experience_section += line + "\n"
        elif current_section == "education":
            education_section += line + "\n"

    education_section = education_section.strip() if education_section else None
    experience_section = experience_section.strip() if experience_section else None

    # ── Structured education entries ─────────────────────────────────────────
    education_entries = _parse_education_entries(education_section or "")

    # ── Experience years ─────────────────────────────────────────────────────
    experience_years = _compute_experience_years(experience_section or "")

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
        "raw_text_length": len(text),
    }
