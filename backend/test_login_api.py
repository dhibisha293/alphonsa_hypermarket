import urllib.request
import json

data = json.dumps({
    "email": "admin@example.com",
    "password": "Password123"
}).encode('utf-8')

req = urllib.request.Request("http://127.0.0.1:8080/api/auth/login", data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print("Status code:", response.status)
        print("Response:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Error Response:", e.read().decode('utf-8'))
