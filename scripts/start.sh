#!/bin/bash

set -e

IMAGE_NAME="msl-block-explorer"
CONTAINER_NAME="msl-block-explorer-container"

HOST_PORT=${1:-3000}
CONTAINER_PORT=3000
PORT_MAPPING="$HOST_PORT:$CONTAINER_PORT"

echo "Building Docker image: $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" .

if [ "$(docker ps -a -q -f name="^${CONTAINER_NAME}$")" ]; then
    echo "Container $CONTAINER_NAME already exists. Removing it..."
    docker stop "$CONTAINER_NAME" > /dev/null
    docker rm "$CONTAINER_NAME" > /dev/null
fi

ENV_FILE_ARGS=""
if [ -f ".env" ]; then
    echo "Found .env file. Passing it to the container..."
    ENV_FILE_ARGS="--env-file .env"
fi

echo "Starting new container: $CONTAINER_NAME on port $HOST_PORT..."
docker run -d --name "$CONTAINER_NAME" -p "$PORT_MAPPING" -v /var/run/docker.sock:/var/run/docker.sock $ENV_FILE_ARGS "$IMAGE_NAME"

echo ""
echo "✅ Docker container started successfully!"
echo "   - Image:     $IMAGE_NAME"
echo "   - Container: $CONTAINER_NAME"
echo "   - Ports:     $PORT_MAPPING (Host:Container)"
echo "   - Access at: http://localhost:$HOST_PORT"
