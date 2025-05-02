#!/bin/bash

APP_DIR="/home/shankar/Api"
LOG_FILE="$APP_DIR/memory_status.log"

# Navigate to app directory
cd "$APP_DIR" || {
  echo "Failed to change directory to $APP_DIR"
  exit 1
}

log_memory_usage() {
  echo "[$(date)] $1" >> "$LOG_FILE"
  free -h >> "$LOG_FILE"
  echo "----------------------------------------" >> "$LOG_FILE"
}

# Log memory usage before starting
echo "Logging memory usage before starting the app..."
log_memory_usage "Memory before starting app:"

# Install dependencies
echo "Installing dependencies..."
npm ci || {
  echo "npm install failed"
  exit 1
}

# Start the app in background and log memory again after a short delay
echo "Starting app..."
npm start &

APP_PID=$!

# Give app a moment to initialize (adjust if needed)
sleep 10

# Log memory usage after app starts
echo "Logging memory usage after starting the app..."
log_memory_usage "Memory after starting app (PID: $APP_PID):"

#  wait for app to finish (or remove if app runs as a service)
wait $APP_PID
