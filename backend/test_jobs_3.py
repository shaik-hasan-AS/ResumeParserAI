import requests

res = requests.post("http://localhost:8000/api/auth/login", data={
    "username": "recruiter4@test.com",
    "password": "password"
})
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# get list of jobs to find the job_id
res = requests.get("http://localhost:8000/api/jobs", headers=headers)
job_id = res.json()[0]["id"]

# get applications
res = requests.get(f"http://localhost:8000/api/jobs/{job_id}/applications", headers=headers)
print("Applications:", res.status_code, res.text)
