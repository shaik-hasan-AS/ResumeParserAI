from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import User
from app.services.auth import create_access_token
from datetime import timedelta
import requests

from dotenv import load_dotenv
load_dotenv()
db = SessionLocal()
user = db.query(User).filter(User.email == "recruiter4@test.com").first()
if user:
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(minutes=30)
    )
    headers = {"Authorization": f"Bearer {access_token}"}
    files = [("files", ("test.pdf", b"%PDF-1.4\n1 0 obj\n<<>>\nendobj", "application/pdf"))]
    data = {
        "title": "Test Scan",
        "description": "Test Desc",
        "keywords": ""
    }
    
    res = requests.post("http://127.0.0.1:8000/api/screener", headers=headers, data=data, files=files)
    print("Screener upload:", res.status_code)
    print(res.text)
    
    res2 = requests.post("http://127.0.0.1:8000/api/jobs/job_id/upload_candidates", headers=headers, files=files)
    print("Job upload:", res2.status_code)
    print(res2.text)
else:
    print("User not found")
