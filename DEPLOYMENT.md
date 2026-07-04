# 🚀 Shopy Stream: Project Overview & Deployment Guide

Welcome to the definitive guide for **Shopy Stream**, the AI-powered Shoppable Video platform. This document is designed to serve as both a **presentation overview** for your stakeholders and a **step-by-step deployment manual** for your engineering team.

---

## 🎯 Part 1: Presentation Overview

*Use this section as the script/outline for your presentation.*

### 1. The Vision
**Shopy Stream** bridges the gap between entertainment and e-commerce. We've built a "Netflix-style" streaming interface where users can watch videos and instantly purchase the items they see on screen. It turns passive viewers into active shoppers seamlessly.

### 2. How It Works (The User Journey)
1. **Browse**: The user lands on a beautiful, dark-themed, cinematic homepage and selects a video to watch.
2. **Watch & Detect**: As the video plays, our background AI actively analyzes the video.
3. **Shop**: Bounding boxes (glowing cyan borders) appear over detectable items (clothes, electronics, furniture, etc.).
4. **Checkout**: A dynamic side-panel appears showing exactly what is on screen, its confidence score, and a "Shop Now" button linked to a real e-commerce platform.

### 3. Architecture & Tech Stack
The platform is built using a modern, decoupled microservices architecture:

* **Frontend (User Experience)**
  * **Tech**: React.js, Vite, TailwindCSS
  * **Role**: Delivers the lightning-fast, glassmorphism UI. It syncs the video's current timestamp with the AI metadata to draw bounding boxes in real-time.
* **Backend (API & Data Routing)**
  * **Tech**: Java Spring Boot, MongoDB
  * **Role**: Acts as the central nervous system. It securely stores the AI's generated timelines and serves them to the frontend on demand via fast REST APIs.
* **AI & Machine Learning (The Brains)**
  * **Tech**: Python, YOLOv8-World, OpenCV
  * **Role**: We use an advanced "open-vocabulary" model. Instead of being restricted to fixed categories, it can detect anything we type in text (e.g., "sunglasses", "couch", "bus"). It processes video frames, finds the bounding box coordinates, and upserts them into MongoDB.

### 4. Key Technical Achievements
* **Automated Syncing**: The frontend uses `useEffect` hooks and the `<video>` element's `onTimeUpdate` to achieve millisecond-accurate sync between the video feed and the AI metadata.
* **Zero-Click Detection**: The moment a user clicks a video, the AI pipeline is automatically initialized—requiring no extra effort from the user.
* **Dynamic Vocabulary**: Easily adaptable to new product lines just by updating a text array in the Python script.

---

## 🛠️ Part 2: Step-by-Step Deployment Guide

*Use this section to deploy the application to a local or production server.*

> [!IMPORTANT]  
> Make sure you have **Node.js**, **Java 17+**, **Python 3.10+**, and **MongoDB** installed on your hosting environment.

### Step 1: Start the Database
The application relies on MongoDB to store the video timelines.
1. Ensure your MongoDB server is running on `localhost:27017`.
2. (Optional) If using Docker, you can run: `docker run -d -p 27017:27017 mongo:latest`

### Step 2: Run the AI Pipeline
To analyze the videos and populate the database with object timelines:
1. Navigate to the root directory.
2. Activate your virtual environment:
   ```bash
   .venv\Scripts\activate
   ```
3. Run the processing script:
   ```bash
   python process_movie.py
   ```
   *Note: This will process `Charade_1963.mp4` using YOLOv8-World and save the metadata to MongoDB.*

### Step 3: Deploy the Spring Boot Backend
The backend serves the MongoDB data to the frontend.
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Build the production `.jar` file:
   ```bash
   ./mvnw clean package -DskipTests
   ```
3. Run the backend:
   ```bash
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```
   *The backend will now be live on `http://localhost:8082`.*

### Step 4: Deploy the React Frontend
The frontend is the user-facing application.
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the production build:
   ```bash
   npm run build
   ```
4. Serve the application locally (or host the `dist` folder on Vercel/Netlify):
   ```bash
   npm run preview
   ```
   *The application will now be accessible via your browser.*

> [!TIP]  
> If deploying to a live web server (like AWS or DigitalOcean), you will need to update the `localhost:8082` API URLs inside `App.jsx` and `ShoppableVideoPlayer.jsx` to point to your live server's IP address or domain name.
