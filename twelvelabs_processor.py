import os
import time
import requests
from twelvelabs import TwelveLabs
from twelvelabs.types import VideoContext_AssetId, AnalyzePromptV2
from pymongo import MongoClient
from moviepy import VideoFileClip

# Configuration
API_KEY = "tlk_0YX5P4818FTGTZ2GFKR0M03X3JA6"
API_URL = "https://api.twelvelabs.io/v1.3"
INDEX_NAME = "shoppablestream_index"
FILENAME = "Charade_1963.mp4"
SHORT_FILENAME = "Charade_1963_short.mp4"

# Connect to MongoDB
client_db = MongoClient("mongodb://localhost:27017/")
db = client_db["shoppablestream"]
collection = db["videoMetadata"]

# 1. Create Index via REST API
print("Creating Marengo Index...")
headers = {"x-api-key": API_KEY}
data = {
    "models": [
        {
            "model_name": "marengo3.0",
            "model_options": ["visual", "audio"]
        }
    ],
    "index_name": INDEX_NAME
}
response = requests.post(f"{API_URL}/indexes", headers=headers, json=data)
if response.status_code == 201:
    index_id = response.json().get("_id")
    print(f"Index created successfully: {index_id}")
else:
    # Might already exist
    print(f"Index creation response: {response.json()}")

# 2. Initialize the SDK client
client = TwelveLabs(api_key=API_KEY)

# 3. Upload Video
filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), FILENAME)
short_filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), SHORT_FILENAME)

if not os.path.exists(short_filepath):
    print("Trimming video to 5 minutes to fit 200MB upload limit...")
    clip = VideoFileClip(filepath).subclipped(0, 300) # first 5 minutes
    clip.write_videofile(short_filepath, codec="libx264")

print(f"Uploading {short_filepath}...")
asset = client.assets.create(
    method="direct",
    file=open(short_filepath, "rb")
)
print(f"Created asset: id={asset.id}")

# 4. Check the status of the asset
print("Waiting for asset to be ready...")
while True:
    asset = client.assets.retrieve(asset.id)
    if asset.status == "ready":
        print("Asset is ready!")
        break
    if asset.status == "failed":
        raise RuntimeError(f"Asset processing failed: id={asset.id}")
    time.sleep(5)

# 5. Analyze your video using Pegasus 1.5
print("Initiating Pegasus 1.5 analysis...")
video = VideoContext_AssetId(asset_id=asset.id)
task = client.analyze_async.tasks.create(
    model_name="pegasus1.5",
    video=video,
    prompt_v_2=AnalyzePromptV2(
        input_text="Identify all distinct shoppable objects (e.g. clothes, furniture, food, tech, accessories) in this video. Provide a highly detailed summary of what each item looks like, its styling, and exactly when it appears. Format it clearly.",
    )
)
print(f"Task ID: {task.task_id}")

# 6. Monitor the task status
while True:
    task = client.analyze_async.tasks.retrieve(task.task_id)

    if task.status == "ready":
        print("Task completed!")
        break
    elif task.status == "failed":
        print("Task failed")
        break
    else:
        print("Task still processing (pegasus1.5)...")
        time.sleep(5)

# 7. Process the results and save to DB
if task.status == "ready":
    result_text = task.result.data
    print("Saving rich metadata to MongoDB...")
    
    collection.update_one(
        {"filename": FILENAME},
        {"$set": {
            "twelvelabs_analysis": result_text,
            "twelvelabs_asset_id": asset.id
        }},
        upsert=True
    )
    
    print("\n--- TWELVELABS SUMMARY ---")
    print(result_text)
    print("--------------------------")
    print("Done!")
