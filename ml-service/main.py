from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import io
from PIL import Image
import uvicorn
import logging
import cv2
import tempfile
import os

app = FastAPI(title="ML Detection Service")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Logic from detections.py ──────────────────────────────────────────────────

# Classes you want for the shopping website (from detections.py)
SELECTED_CLASSES = [
    "chair", "tie", "umbrella", "cup", "bottle", "tv", "book", "laptop",
    "cell phone", "handbag", "vase", "suitcase", "remote", "wine glass",
    "bowl", "teddy bear", "skateboard", "skis", "surfboard"
]

# Category mapping (from detections.py)
CATEGORY_MAP = {
    "chair":      "Furniture",
    "tie":        "Fashion",
    "umbrella":   "Accessories",
    "cup":        "Kitchen",
    "bottle":     "Kitchen",
    "tv":         "Electronics",
    "book":       "Books",
    "laptop":     "Electronics",
    "cell phone": "Electronics",
    "handbag":    "Fashion",
    "vase":       "Home Decor",
    "suitcase":   "Travel",
    "remote":     "Electronics",
    "wine glass": "Kitchen",
    "bowl":       "Kitchen",
    "teddy bear": "Toys",
    "skateboard": "Sports",
    "skis":       "Sports",
    "surfboard":  "Sports",
}

# Product name mapping (from detections.py)
PRODUCT_MAP = {
    "chair":      "Ergonomic Office Chair",
    "tie":        "Premium Silk Tie",
    "umbrella":   "Travel Umbrella",
    "cup":        "Ceramic Coffee Mug",
    "bottle":     "Hydro Flask Bottle",
    "tv":         "Samsung Smart TV",
    "wine glass": "Crystal Wine Glass Set",
    "book":       "Business Strategy Book",
    "bowl":       "Ceramic Bowl Set",
    "laptop":     "MacBook Air",
    "cell phone": "iPhone 15",
    "remote":     "Universal Remote",
    "suitcase":   "Travel Suitcase",
    "handbag":    "Leather Handbag",
    "vase":       "Decorative Vase",
    "skateboard": "Street Skateboard",
    "teddy bear": "Plush Teddy Bear",
    "skis":       "All-Mountain Skis",
    "surfboard":  "Beginner Surfboard",
}

# Price mapping (from detections.py)
PRICE_MAP = {
    "chair":      149,
    "tie":         29,
    "umbrella":    24,
    "cup":         12,
    "bottle":      35,
    "tv":         699,
    "wine glass":  45,
    "book":        15,
    "bowl":        20,
    "laptop":     999,
    "cell phone": 799,
    "remote":      25,
    "suitcase":    89,
    "handbag":     79,
    "vase":        30,
    "skateboard": 120,
    "teddy bear":  18,
    "skis":       450,
    "surfboard":  350,
}

# ─── Load YOLOv8 model (from yolov8.py) ────────────────────────────────────────

logger.info("Loading YOLOv8 model...")
model = YOLO("yolov8s.pt")
logger.info("Model loaded successfully.")


def enrich_detection(label: str, conf: float, box: dict) -> dict:
    """Attach product info from detections.py mappings to a raw YOLO detection."""
    return {
        "label":        label,
        "confidence":   conf,
        "box":          box,
        "category":     CATEGORY_MAP.get(label, "General"),
        "product_name": PRODUCT_MAP.get(label, label.title()),
        "price":        PRICE_MAP.get(label, 0),
        "shop_url":     f"https://www.amazon.com/s?k={label.replace(' ', '+')}"
    }


# ─── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/api/detect")
async def detect_objects(file: UploadFile = File(...)):
    """Detect shoppable objects in a single image (mirrors yolov8.py frame logic)."""
    try:
        image = Image.open(io.BytesIO(await file.read()))
        results = model(image, conf=0.3)

        detections = []
        for r in results:
            for box in r.boxes:
                label = model.names[int(box.cls[0])]
                if label not in SELECTED_CLASSES:
                    continue
                conf = float(box.conf[0])
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                detections.append(enrich_detection(
                    label, conf,
                    {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
                ))

        return JSONResponse(content={"status": "success", "detections": detections})

    except Exception as e:
        logger.error(f"Detection error: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


@app.post("/api/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    """
    Process video frame by frame (yolov8.py logic), filter via SELECTED_CLASSES
    (detections.py logic), and return a per-second timeline with product data.
    """
    try:
        fd, temp_path = tempfile.mkstemp(suffix=".mp4")
        with os.fdopen(fd, "wb") as f:
            f.write(await file.read())

        logger.info(f"Processing video: {temp_path}")
        cap = cv2.VideoCapture(temp_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = max(1, int(fps))  # sample 1 frame per second

        timeline = {}
        frame_count = 0
        second_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % frame_interval == 0:
                # ── yolov8.py detection core ──
                results = model(frame, conf=0.3)
                detections = []

                for r in results:
                    for box in r.boxes:
                        label = model.names[int(box.cls[0])]

                        # ── detections.py filter ──
                        if label not in SELECTED_CLASSES:
                            continue

                        conf = float(box.conf[0])
                        x1, y1, x2, y2 = box.xyxy[0].tolist()

                        # ── detections.py enrichment ──
                        detections.append(enrich_detection(
                            label, conf,
                            {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
                        ))

                timeline[str(second_count)] = detections
                second_count += 1

            frame_count += 1

        cap.release()
        os.remove(temp_path)
        logger.info(f"Done. {second_count} seconds analyzed.")

        return JSONResponse(content={"status": "success", "timeline": timeline})

    except Exception as e:
        logger.error(f"Video processing error: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
