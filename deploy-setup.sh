#!/bin/bash
# EC2 User Data Script for Shopy Stream
# Operating System: Ubuntu 22.04 LTS

# Exit immediately if a command exits with a non-zero status
set -e

# Update packages
sudo apt-get update -y

# Install prerequisite packages
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

# Add Docker's official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Docker Compose
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to the docker group so we can run docker without sudo
sudo usermod -aG docker ubuntu

# Create the project directory
sudo -u ubuntu mkdir -p /home/ubuntu/shopy-stream-app

echo "Setup Complete! The server is ready to deploy Shopy Stream."
