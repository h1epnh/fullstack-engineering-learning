#!/bin/bash

# Script to run Redis using Docker Compose

set -e  # Exit on error

echo "🚀 Starting Redis with Docker Compose..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found in current directory"
    exit 1
fi

# Stop and remove existing containers (if any)
echo "🧹 Cleaning up existing containers..."
docker-compose down

# Start Redis
echo "📦 Starting Redis container..."
docker-compose up -d

# Wait for Redis to be healthy
echo "⏳ Waiting for Redis to be ready..."
sleep 3

# Check container status
if docker-compose ps | grep -q "Up"; then
    echo "✅ Redis is running successfully!"
    echo ""
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "🔗 Connection details:"
    echo "   Host: localhost"
    echo "   Port: 6379"
    echo ""
    echo "💡 Useful commands:"
    echo "   View logs:     docker-compose logs -f"
    echo "   Stop Redis:    docker-compose down"
    echo "   Redis CLI:     docker exec -it redis-server redis-cli"
else
    echo "❌ Failed to start Redis. Check logs with: docker-compose logs"
    exit 1
fi