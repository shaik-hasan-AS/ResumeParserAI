import requests

# register as recruiter
res = requests.post("http://localhost:8000/api/auth/register", json={
    "name": "Recruiter Test 4",
    "email": "recruiter4@test.com",
    "password": "password",
    "role": "recruiter"
})
print("Register:", res.status_code, res.text)
token = None
if res.status_code == 400:
    res = requests.post("http://localhost:8000/api/auth/login", data={
        "username": "recruiter4@test.com",
        "password": "password"
    })
    token = res.json()["access_token"]
else:
    res = requests.post("http://localhost:8000/api/auth/login", data={
        "username": "recruiter4@test.com",
        "password": "password"
    })
    token = res.json()["access_token"]

headers = {"Authorization": f"Bearer {token}"}

# create job
res = requests.post("http://localhost:8000/api/jobs", json={
    "title": "Software Engineer",
    "description": "Python, React, SQL"
}, headers=headers)
print("Create job:", res.status_code, res.text)
if res.status_code == 200:
    job_id = res.json()["id"]
    # get list of jobs
    res = requests.get("http://localhost:8000/api/jobs", headers=headers)
    print("List jobs:", res.status_code)
    
    # upload candidates
    # Create a dummy PDF
    with open("dummy.pdf", "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000219 00000 n \n0000000307 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n402\n%%EOF")

    files = {'files': ('dummy.pdf', open('dummy.pdf', 'rb'), 'application/pdf')}
    res = requests.post(f"http://localhost:8000/api/jobs/{job_id}/upload_candidates", headers=headers, files=files)
    print("Upload candidates:", res.status_code, res.text)
