import requests

# register as recruiter
res = requests.post("http://localhost:8000/api/auth/register", json={
    "name": "Recruiter Test 3",
    "email": "recruiter3@test.com",
    "password": "password",
    "role": "recruiter"
})
print("Register:", res.status_code, res.text)
if res.status_code == 400:
    res = requests.post("http://localhost:8000/api/auth/login", data={
        "username": "recruiter3@test.com",
        "password": "password"
    })
    token = res.json()["access_token"]
else:
    res = requests.post("http://localhost:8000/api/auth/login", data={
        "username": "recruiter3@test.com",
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
