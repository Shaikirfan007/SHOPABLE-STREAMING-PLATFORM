import os
import cv2
import torch
import pandas as pd
from pymongo import MongoClient

# Connect to MongoDB (allows overriding via ENV for Docker)
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(mongo_uri)
db = client["shoppablestream"]
collection = db["videoMetadata"]

# Classes and mapping from ml-service
SELECTED_CLASSES = [
    "coat", "shoe", "t-shirt", "pants", "dress", "chair", "table", "tv","clothes",
    "bag", "sunglasses", "hat", "furniture", "food", "laptop", "cell phone", 
    "bottle", "cup", "car", "bicycle", "sofa", "bed", "dining table", 
    "microwave", "oven", "refrigerator", "book", "clock", "vase", "teddy bear", 
    "backpack", "umbrella", "handbag", "tie", "suitcase", "wine glass", 
    "bowl", "potted plant", "motorcycle", "airplane", "bus", "train", "truck", 
    "boat", "bench", "jewelry", "watch", "necklace", "earrings", "ring", "jacket", "sweater"
]

CATEGORY_MAP = {
    "chair": "Furniture", "table": "Furniture", "sofa": "Furniture", "bed": "Furniture",
    "furniture": "Furniture", "dining table": "Furniture",
    "coat": "Fashion", "shoe": "Fashion", "t-shirt": "Fashion", "pants": "Fashion", 
    "dress": "Fashion", "bag": "Fashion", "sunglasses": "Fashion", "hat": "Fashion",
    "handbag": "Fashion", "tie": "Fashion", "jewelry": "Accessories", "watch": "Accessories",
    "necklace": "Accessories", "earrings": "Accessories", "ring": "Accessories",
    "jacket": "Fashion", "sweater": "Fashion",
    "laptop": "Electronics", "cell phone": "Electronics", "tv": "Electronics",
    "microwave": "Appliances", "oven": "Appliances", "refrigerator": "Appliances",
    "cup": "Kitchen", "bottle": "Kitchen", "wine glass": "Kitchen", "bowl": "Kitchen",
    "book": "Books", "vase": "Home Decor", "clock": "Home Decor", "potted plant": "Home Decor",
    "teddy bear": "Toys", "umbrella": "Accessories", "suitcase": "Travel", "backpack": "Travel",
    "car": "Vehicles", "bicycle": "Vehicles", "motorcycle": "Vehicles", "airplane": "Vehicles",
    "bus": "Vehicles", "train": "Vehicles", "truck": "Vehicles", "boat": "Vehicles",
    "food": "Food"
}

def enrich_detection(label, conf, box):
    return {
        "label": label,
        "confidence": conf,
        "box": box,
        "category": CATEGORY_MAP.get(label, "General"),
        "shop_url": f"https://www.amazon.com/s?k={label.replace(' ', '+')}"
    }

print("Loading YOLO-World model...")
from ultralytics import YOLOWorld
model = YOLOWorld('yolov8s-world.pt')
model.set_classes(SELECTED_CLASSES)

filename = "Charade_1963.mp4"
filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
print(f"Opening video {filepath}")

cap = cv2.VideoCapture(filepath)
fps = cap.get(cv2.CAP_PROP_FPS)
if fps == 0:
    fps = 24
frame_interval = int(fps)

timeline = {}
frame_count = 0
second_count = 0

print(f"Processing entire video at 1 FPS...")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    if frame_count % frame_interval == 0:
        results = model.predict(frame, conf=0.1, verbose=False)
        detections = []
        df = results[0].boxes.data.cpu().numpy()
        for row in df:
            x1, y1, x2, y2, conf, cls_id = row
            label = SELECTED_CLASSES[int(cls_id)]
            if label not in SELECTED_CLASSES:
                continue
            detections.append(enrich_detection(
                label, float(conf), {"x1": float(x1), "y1": float(y1), "x2": float(x2), "y2": float(y2)}
            ))
        
        timeline[str(second_count)] = detections
        if second_count % 10 == 0:
            print(f"Processed {second_count} seconds...")
        second_count += 1

    frame_count += 1

cap.release()
print(f"Finished processing {second_count} seconds. Saving to MongoDB...")

# Upsert into MongoDB
collection.update_one(
    {"filename": filename},
    {"$set": {
        "status": "completed",
        "timeline": timeline,
        "_class": "com.shoppablestream.backend.models.VideoMetadata"
    }},
    upsert=True
)

print("Done!")
