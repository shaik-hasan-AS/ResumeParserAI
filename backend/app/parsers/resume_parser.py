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
        "experience", "education", "skills", "portfolio", "github", "linkedin",
        "nurse", "accountant", "teacher", "consultant", "analyst", "director",
        "executive", "assistant", "specialist", "coordinator", "designer", 
        "artist", "writer", "publications", "references", "hobbies", 
        "activities", "honors", "awards", "volunteer", "certifications", 
        "licenses", "projects", "languages"
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
            
    # Universal skills extraction using regex boundaries to avoid partial matches
    universal_skills = [
        # Tech & Data
        "Python", "React", "SQL", "JavaScript", "Next.js", "FastAPI", "C++", "Java", 
        "Docker", "AWS", "Node.js", "TypeScript", "Tailwind", "Machine Learning", 
        "Data Analysis", "Azure", "GCP", "Kubernetes", "Git", "HTML", "CSS", "PHP", 
        "Ruby", "Go", "Rust", "Swift", "Kotlin", "Angular", "Vue.js", "Django", "Flask",
        "Spring Boot", "Hibernate", "Express.js", "MongoDB", "PostgreSQL", "MySQL", 
        "Redis", "Cassandra", "Oracle", "SQLite", "GraphQL", "REST APIs", "SOAP", 
        "Microservices", "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "Terraform", 
        "Ansible", "Chef", "Puppet", "Linux", "Unix", "Bash", "PowerShell", "Data Science", 
        "Data Visualization", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", 
        "Keras", "Hadoop", "Spark", "Kafka", "Airflow", "Elasticsearch", "Kibana", 
        "Logstash", "Prometheus", "Grafana",
        
        # Business, Finance & Sales
        "Accounting", "Financial Modeling", "SEO", "CRM", "Salesforce", "B2B", "B2C", 
        "Budgeting", "Strategy", "Marketing", "Business Development", "Lead Generation", 
        "Data Entry", "Excel", "QuickBooks", "Tableau", "Power BI", "Sales", "Negotiation",
        "Account Management", "Customer Success", "Cold Calling", "Lead Qualification", 
        "Market Research", "Competitor Analysis", "Strategic Planning", "Product Management", 
        "Brand Management", "Digital Marketing", "SEM", "PPC", "Google Ads", "Google Analytics", 
        "Email Marketing", "Mailchimp", "Social Media Management", "Financial Analysis", 
        "Risk Management", "Investment Banking", "Equity Research", "Auditing", "IFRS", 
        "GAAP", "Accounts Payable", "Accounts Receivable", "Payroll", "Taxation", 
        "Contract Negotiation", "Supply Chain Management", "Logistics", "Inventory Management", 
        "Procurement", "Vendor Management", "Quality Assurance", "Quality Control", 
        "Six Sigma", "Lean Manufacturing",
        
        # Healthcare & Clinical
        "Patient Care", "CPR", "EHR", "HIPAA", "BLS", "ACLS", "Triage", "Phlebotomy", 
        "Nursing", "Medical Terminology", "EMR", "Vital Signs", "Infection Control",
        "Patient Assessment", "Medication Administration", "IV Therapy", "Wound Care", 
        "Electronic Health Records", "Electronic Medical Records", "ICD-10", "CPT Coding", 
        "Medical Billing", "Health Information Management", "Pharmacy Technician", 
        "Radiography", "Sonography", "Physical Therapy", "Occupational Therapy", 
        "Speech Therapy", "Psychology", "Counseling", "Social Work", "Case Management",
        
        # Design & Media
        "UI/UX", "Adobe Creative Suite", "Graphic Design", "Copywriting", "Video Editing", 
        "Photoshop", "Illustrator", "Figma", "Sketch", "Social Media Marketing", "Content Creation",
        "Wireframing", "Prototyping", "User Research", "Usability Testing", "Information Architecture", 
        "Interaction Design", "Visual Design", "Typography", "Color Theory", "Layout", 
        "Branding", "Logo Design", "Print Design", "Web Design", "Animation", "Motion Graphics", 
        "After Effects", "Premiere Pro", "Final Cut Pro", "Lightroom", "InDesign", "Photography", 
        "Audio Editing",
        
        # General & Soft Skills
        "Project Management", "Agile", "Scrum", "Leadership", "Communication", "Public Speaking", 
        "Problem Solving", "Teamwork", "Time Management", "Customer Service", "Critical Thinking", 
        "Operations", "Event Planning", "Research", "Cross-functional Team Leadership", 
        "Conflict Resolution", "Adaptability", "Empathy", "Creativity", "Emotional Intelligence", 
        "Mentorship", "Training & Development", "Presentation Skills", "Analytical Skills", 
        "Attention to Detail", "Organization", "Multitasking", "Stress Management", 
        "Decision Making", "Strategic Thinking", "Innovation", "Resourcefulness", 
        "Client Relations", "Stakeholder Management", "Bilingual", "Multilingual",
        
        # Education, Legal & Other
        "Curriculum Development", "Lesson Planning", "Classroom Management", "Special Education", 
        "E-Learning", "Moodle", "Blackboard", "Canvas", "Instructional Design", "Corporate Training", 
        "Legal Research", "Contract Drafting", "Litigation", "Corporate Law", "Intellectual Property", 
        "Paralegal", "Notary Public", "Real Estate", "Property Management"
    ]
    
    found_skills = []
    text_lower = text.lower()
    for skill in universal_skills:
        # Use regex word boundaries to avoid matching "C" in "React"
        # Re.escape safely handles skills with special characters like C++ or Next.js
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)
    
    # Basic section extraction heuristic
    experience_section = ""
    education_section = ""
    current_section = None
    
    exp_keywords = {
        "experience", "work experience", "employment history", "professional experience", 
        "clinical experience", "teaching experience", "relevant experience", "work history"
    }
    edu_keywords = {
        "education", "academic background", "academic history", "qualifications", "training"
    }
    reset_keywords = {
        "skills", "projects", "certifications", "summary", "profile", "languages",
        "publications", "affiliations", "volunteer experience", "leadership", 
        "awards", "honors", "references", "activities", "interests", "licenses"
    }
    
    # Very basic boundary detection
    for line in lines:
        lower_line = line.strip().lower()
        # If the line is short, it might be a header
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
    
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": found_skills,
        "experience": experience_section.strip() if experience_section else None,
        "education": education_section.strip() if education_section else None,
        "raw_text_length": len(text)
    }
