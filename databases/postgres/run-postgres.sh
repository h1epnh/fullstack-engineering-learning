#!/bin/bash

# Script to run PostgreSQL using Docker Compose

set -e  # Exit on error

echo "🚀 Starting PostgreSQL with Docker Compose..."

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

# Start PostgreSQL
echo "📦 Starting PostgreSQL container..."
docker-compose up -d

# Wait for PostgreSQL to be healthy
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check container status
if docker-compose ps | grep -q "Up"; then
    echo "✅ PostgreSQL is running successfully!"
    echo ""
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "🔗 Connection details:"
    echo "   Host:     localhost"
    echo "   Port:     5432"
    echo "   Database: mydb"
    echo "   User:     postgres"
    echo "   Password: postgres"
    echo ""
    echo "💡 Useful commands:"
    echo "   View logs:       docker-compose logs -f"
    echo "   Stop PostgreSQL: docker-compose down"
    echo "   psql CLI:        docker exec -it postgres-server psql -U postgres -d mydb"
    echo "   Create backup:   docker exec postgres-server pg_dump -U postgres mydb > backup.sql"
    echo ""
    echo "⚠️  Remember to change the default password in production!"
else
    echo "❌ Failed to start PostgreSQL. Check logs with: docker-compose logs"
    exit 1
fi