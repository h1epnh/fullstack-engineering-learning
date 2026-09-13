#!/bin/bash

# Docker Compose Runner Script
# Usage: ./run-docker.sh [up|down|restart|logs|ps|build]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="kafka"

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if docker-compose.yml exists
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "docker-compose.yml not found in current directory!"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Main command handling
ACTION=${1:-up}

case $ACTION in
    up)
        print_info "Starting services with docker-compose..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d
        print_info "Services started successfully!"
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
        ;;
    
    down)
        print_info "Stopping and removing services..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
        print_info "Services stopped successfully!"
        ;;
    
    restart)
        print_info "Restarting services..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" restart
        print_info "Services restarted successfully!"
        ;;
    
    logs)
        print_info "Showing logs (Ctrl+C to exit)..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f
        ;;
    
    ps)
        print_info "Listing running services..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
        ;;
    
    build)
        print_info "Building services..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build
        print_info "Build completed successfully!"
        ;;
    
    rebuild)
        print_info "Rebuilding and restarting services..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d
        print_info "Services rebuilt and started successfully!"
        ;;
    
    *)
        print_error "Unknown command: $ACTION"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  up       - Start services in detached mode (default)"
        echo "  down     - Stop and remove services"
        echo "  restart  - Restart services"
        echo "  logs     - Show and follow logs"
        echo "  ps       - List running services"
        echo "  build    - Build services"
        echo "  rebuild  - Rebuild and restart services"
        exit 1
        ;;
esac