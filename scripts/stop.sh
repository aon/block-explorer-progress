#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# This should match the CONTAINER_NAME in your start.sh script.
CONTAINER_NAME="msl-block-explorer-container"
# ---

echo "Checking for container '$CONTAINER_NAME'..."

# Check if the container exists and is running or stopped.
if [ "$(docker ps -a -q -f name="^${CONTAINER_NAME}$")" ]; then
    echo "Found container. Stopping and removing it..."
    docker stop "$CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"
    echo "✅ Container '$CONTAINER_NAME' stopped and removed successfully."
else
    echo "Container '$CONTAINER_NAME' not found. Nothing to do."
fi
