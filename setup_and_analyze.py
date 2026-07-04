import requests
import json
import time

API_KEY = "tlk_0YX5P4818FTGTZ2GFKR0M03X3JA6"
API_URL = "https://api.twelvelabs.io/v1.3"

print("Creating Index with pegasus1.2...")
headers = {"x-api-key": API_KEY, "Content-Type": "application/json"}
data = {
    "index_name": "shoppablestream_full_index_2",
    "models": [
        {"model_name": "marengo3.0", "model_options": ["visual", "audio"]},
        {"model_name": "pegasus1.2", "model_options": ["visual", "audio"]}
    ]
}
res = requests.post(f"{API_URL}/indexes", headers=headers, json=data)
if res.status_code == 201:
    index_id = res.json().get("_id")
else:
    print("Index already exists or error:", res.json())
    # Fetch existing index
    indices = requests.get(f"{API_URL}/indexes", headers=headers).json().get("data", [])
    index_id = next((i["_id"] for i in indices if i["index_name"] == "shoppablestream_full_index"), None)

print("Index ID:", index_id)

# 2. Upload video
print("Uploading Video...")
files = {"video_file": open("Charade_1963_short.mp4", "rb")}
data = {"index_id": index_id, "language": "en"}
res = requests.post(f"{API_URL}/tasks", headers={"x-api-key": API_KEY}, data=data, files=files)
task_id = res.json().get("_id")
video_id = res.json().get("video_id")
print("Task ID:", task_id, "Video ID:", video_id)

print("Waiting for indexing to complete... (this may take a minute)")
while True:
    time.sleep(10)
    res = requests.get(f"{API_URL}/tasks/{task_id}", headers=headers)
    status = res.json().get("status")
    print("Status:", status)
    if status == "ready": break
    if status == "failed": exit(1)

# 3. Test analyze
print("Testing /analyze...")
prompt = "List all the products shown in the video with timeline: [start, end], brand, product_name, location: [x%, y%, width%, height%], price, description. Respond with a valid JSON array only."
res = requests.post(f"{API_URL}/analyze", headers=headers, json={"video_id": video_id, "prompt": prompt})
print(res.status_code, res.text)
