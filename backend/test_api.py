import requests
import json
import time

# Give the server a second just in case
time.sleep(1)

url = "http://localhost:8000/api/v1/ai/chat"
payload = {"query": "Give me an executive summary of the stores current performance including our total entries and purchases."}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print("STATUS:", response.status_code)
    print("RESPONSE:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("ERROR:", str(e))
