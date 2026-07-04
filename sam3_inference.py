import os
import json
import cv2
import numpy as np
from ultralytics import YOLOWorld, SAM

# Classes and mapping
SELECTED_CLASSES = [
    "coat", "jacket", "shirt", "t-shirt", "sweater", "pants", "jeans", "dress", 
    "skirt", "shoe", "sneaker", "boot", "glasses", "sunglasses", "hat", "bag", 
    "backpack", "purse", "watch", "jewelry", "chair", "sofa", "couch", "table", 
    "desk", "bed", "cabinet", "furniture", "tv", "monitor", "laptop", "cell phone", 
    "bottle", "cup", "bowl", "fork", "knife", "spoon", "utensil", "plate", 
    "food", "pizza", "burger", "cake", "apple", "banana", "car", "bicycle", 
    "motorcycle", "bus", "truck", "vehicle"
]

CATEGORY_MAP = {
    "coat": "Fashion", "jacket": "Fashion", "shirt": "Fashion", "t-shirt": "Fashion", 
    "sweater": "Fashion", "pants": "Fashion", "jeans": "Fashion", "dress": "Fashion", 
    "skirt": "Fashion", "shoe": "Fashion", "sneaker": "Fashion", "boot": "Fashion", 
    "glasses": "Accessories", "sunglasses": "Accessories", "hat": "Accessories", 
    "bag": "Accessories", "backpack": "Accessories", "purse": "Accessories", 
    "watch": "Accessories", "jewelry": "Accessories",
    "chair": "Furniture", "sofa": "Furniture", "couch": "Furniture", "table": "Furniture", 
    "desk": "Furniture", "bed": "Furniture", "cabinet": "Furniture", "furniture": "Furniture",
    "tv": "Electronics", "monitor": "Electronics", "laptop": "Electronics", "cell phone": "Electronics",
    "bottle": "Kitchen", "cup": "Kitchen", "bowl": "Kitchen", "fork": "Kitchen", 
    "knife": "Kitchen", "spoon": "Kitchen", "utensil": "Kitchen", "plate": "Kitchen",
    "food": "Groceries", "pizza": "Groceries", "burger": "Groceries", "cake": "Groceries", 
    "apple": "Groceries", "banana": "Groceries",
    "car": "Vehicles", "bicycle": "Vehicles", "motorcycle": "Vehicles", 
    "bus": "Vehicles", "truck": "Vehicles", "vehicle": "Vehicles"
}

def extract_frames(video_path="sam3/Charade_1963_short.mp4", output_dir="frames_sam3", max_frames=20):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    cap = cv2.VideoCapture(video_path)
    count = 0
    success = True
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0:
        fps = 24
    frame_interval = int(fps)
    
    frame_count = 0
    
    # Process only first 10 seconds for demo purposes
    while success and count < 10: 
        success, image = cap.read()
        if success and frame_count % frame_interval == 0:
            cv2.imwrite(os.path.join(output_dir, f"frame_{count:04d}.jpg"), image)
            count += 1
        frame_count += 1
    cap.release()
    print(f"Extracted {count} frames")

def generate_masks():
    print("Initializing YOLO-World and SAM 2 Models...")
    # Initialize YOLO-World
    yolo_model = YOLOWorld('yolov8s-world.pt')
    yolo_model.set_classes(SELECTED_CLASSES)
    
    # Initialize SAM 2
    sam_model = SAM('sam2_s.pt')
    
    timeline_data = {}
    
    frames_dir = "frames_sam3"
    frames = sorted([f for f in os.listdir(frames_dir) if f.endswith('.jpg')])[:20]
    
    for second, frame_file in enumerate(frames):
        frame_path = os.path.join(frames_dir, frame_file)
        print(f"Processing second {second}: {frame_file}")
        
        # 1. Get Bounding Boxes from YOLO
        yolo_results = yolo_model.predict(frame_path, conf=0.1, verbose=False)
        frame_data = []
        
        df = yolo_results[0].boxes.data.cpu().numpy()
        for row in df:
            x1, y1, x2, y2, conf, cls_id = row
            label = SELECTED_CLASSES[int(cls_id)]
            
            # 2. Get Pixel Mask from SAM 2 using the bounding box
            # SAM prompt format requires bboxes in [x1, y1, x2, y2]
            bbox = [float(x1), float(y1), float(x2), float(y2)]
            sam_results = sam_model(frame_path, bboxes=[bbox], verbose=False)
            
            # 3. Extract the mask contour and convert to % coordinates
            mask_points_percent = []
            if sam_results and len(sam_results) > 0 and sam_results[0].masks is not None:
                # Get image dimensions to calculate percentages
                img_h, img_w = sam_results[0].orig_shape
                
                # Get the first (and only) mask contour from the result
                # xy contains lists of segments. We take the largest segment.
                segments = sam_results[0].masks.xy
                if segments and len(segments) > 0:
                    largest_segment = max(segments, key=len)
                    
                    # Reduce points to keep JSON small (approx poly)
                    epsilon = 0.01 * cv2.arcLength(largest_segment.astype(np.float32), True)
                    approx = cv2.approxPolyDP(largest_segment.astype(np.float32), epsilon, True)
                    
                    for pt in approx:
                        px, py = pt[0]
                        mask_points_percent.append([
                            round((px / img_w) * 100, 2),
                            round((py / img_h) * 100, 2)
                        ])
            
            # Only add if a mask was successfully generated
            if mask_points_percent:
                frame_data.append({
                    "product": label.capitalize(),
                    "category": CATEGORY_MAP.get(label, "General"),
                    "price": str(np.random.randint(20, 200)), # Mock price for demo
                    "shop_url": f"https://www.amazon.com/s?k={label.replace(' ', '+')}",
                    "confidence": round(float(conf), 2),
                    "mask": mask_points_percent
                })
                
        timeline_data[str(second)] = frame_data
        
    # Custom JSON encoder to handle float32
    class NumpyEncoder(json.JSONEncoder):
        def default(self, obj):
            import numpy as np
            if isinstance(obj, np.floating):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return super(NumpyEncoder, self).default(obj)
            
    with open('frontend/public/sam3_charade_timeline.json', 'w') as f:
        json.dump(timeline_data, f, indent=2, cls=NumpyEncoder)
        
    print("Timeline data with actual SAM 2 polygon masks saved to sam3_timeline.json")

if __name__ == "__main__":
    video_path = "sam3/Charade_1963_short.mp4"
    if os.path.exists(video_path):
        extract_frames(video_path)
    generate_masks()
