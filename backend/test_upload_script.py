import requests
import json

url = "http://127.0.0.1:8000/api/auth/login"
data = {"username": "admin@example.com", "password": "password"} # Adjust if needed
res = requests.post(url, data=data)
if res.status_code == 200:
    token = res.json()["access_token"]
    print("Logged in!")
    
    headers = {"Authorization": f"Bearer {token}"}
    files = [("files", ("test.pdf", b"%PDF-1.4\n1 0 obj\n<<>>\nendobj", "application/pdf"))]
    data = {
        "title": "Test Scan",
        "description": "Test Desc",
        "keywords": ""
    }
    
    res = requests.post("http://127.0.0.1:8000/api/screener", headers=headers, data=data, files=files)
    print(res.status_code)
    print(res.text)
else:
    print("Login failed:", res.status_code, res.text)
