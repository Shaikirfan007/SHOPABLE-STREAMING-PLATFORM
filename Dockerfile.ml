# Use the official Python image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Python script and the video file
COPY process_movie.py .
COPY Charade_1963.mp4 .

# Command to run the processing script
CMD ["python", "process_movie.py"]
