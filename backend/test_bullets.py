import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import SessionLocal
from app.models import models
import json

db = SessionLocal()
parsed = db.query(models.ParsedData).order_by(models.ParsedData.id.desc()).first()
if parsed:
    proj = parsed.parsed_json.get("projects", "")
    if proj:
        print("Found projects string of length", len(proj))
        lines = proj.split("\n")
        for line in lines[:15]:
            if line.strip():
                first_chars = line.strip()[:10]
                codes = [hex(ord(c)) for c in first_chars]
                print(f"Line: {first_chars}... Codes: {codes}")
    else:
        print("No projects found in latest parsed data")
else:
    print("No parsed data found")
