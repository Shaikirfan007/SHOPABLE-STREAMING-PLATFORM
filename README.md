# 🛒 Shoppable Streaming Platform

A modern, interactive streaming platform where viewers can click on objects inside a playing video to instantly discover and purchase them. Powered by AI object detection and seamlessly integrated with live e-commerce stores (WooCommerce & Amazon).

---

## ✨ Features
- **AI Object Detection:** Automatically detects up to 80 different objects (clothes, electronics, furniture, etc.) in video streams using **YOLOv8**.
- **Interactive Video Player:** Viewers can click on highlighted bounding boxes during video playback to see product details.
- **E-Commerce Integration:** Instantly maps detected objects to real products in your **WooCommerce** store or falls back to Amazon affiliate links.
- **Scalable Backend:** Robust **Spring Boot** architecture using WebFlux and MongoDB for storing time-series metadata of objects in the video.
- **Dockerized ML Service:** A standalone Python/FastAPI microservice handles the heavy lifting of running YOLOv8 frame-by-frame analysis at 1 FPS.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **React.js (Vite)**
- **TailwindCSS** for modern, responsive UI styling
- `@woocommerce/woocommerce-rest-api` for live store connectivity

### Backend
- **Java Spring Boot 3**
- **Spring WebFlux** (Reactive web client for async ML requests)
- **MongoDB** (Storing timeline-based video metadata & detections)

### Machine Learning Service
- **Python 3.10** & **FastAPI**
- **YOLOv8 (Ultralytics)** for object detection and bounding box generation
- **OpenCV** & **Pillow** for frame extraction and image processing

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Java 17
- Maven
- Docker & Docker Compose

### 1. Start the ML Service and Databases (Docker)
The Machine Learning service and MongoDB run in Docker.
```bash
docker-compose up -d --build
```
*This will spin up the YOLOv8 FastAPI service on port 8000 and MongoDB on port 27017.*

### 2. Start the Spring Boot Backend
Navigate to the `backend` folder and run the Spring Boot application:
```bash
cd backend
./mvnw spring-boot:run
```
*The backend API will be available on port 8080.*

### 3. Start the React Frontend
Navigate to the `frontend` folder, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
*The web app will be available on http://localhost:5173.*

---

## ⚙️ Configuration

### WooCommerce Integration
To connect your own store, open `frontend/src/utils/woocommerce.js` and add your keys:
```javascript
const WooCommerce = new WooCommerceRestApi({
  url: 'https://your-store-url.com', 
  consumerKey: 'ck_your_consumer_key', 
  consumerSecret: 'cs_your_consumer_secret', 
  version: 'wc/v3'
});
```

---

## 🎥 How it Works
1. **Upload:** User uploads an MP4 video via the React UI.
2. **Analysis:** The Spring Boot backend forwards the video to the ML Service.
3. **Detection:** YOLOv8 analyzes the video at 1 frame per second, generating bounding boxes and classifying objects (e.g., "laptop", "tie", "cup").
4. **Metadata Storage:** The detections are enriched with product metadata and stored chronologically in MongoDB.
5. **Playback:** As the user watches the video, the React player syncs with the timeline metadata to draw pixel-perfect interactive overlays on the video.

---

## 📄 License
This project is licensed under the MIT License.