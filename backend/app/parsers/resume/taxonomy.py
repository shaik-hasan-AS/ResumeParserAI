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

def categorize_skills(found_skills: list[str]) -> dict:
    categorized = {"technical": [], "soft": [], "tools": []}
    for skill in found_skills:
        cat = SKILL_TAXONOMY.get(skill, "technical")
        categorized[cat].append(skill)
    return categorized
