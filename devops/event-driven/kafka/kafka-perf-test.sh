#!/bin/bash

# Kafka Performance Testing Script for MacOS
# This script tests Kafka throughput, latency, and resource usage

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
KAFKA_CONTAINER="kafka"
BOOTSTRAP_SERVER="localhost:9094"
TEST_TOPIC="perf-test-topic"
RESULTS_DIR="./performance-results"

# Test parameters
NUM_RECORDS=1000000
RECORD_SIZE=1024  # 1KB
THROUGHPUT=-1     # Unlimited
NUM_THREADS=1

# Create results directory
mkdir -p "$RESULTS_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULT_FILE="$RESULTS_DIR/kafka_perf_${TIMESTAMP}.txt"

# Function to check if Kafka is running
check_kafka() {
    print_info "Checking Kafka status..."
    if ! docker ps | grep -q "$KAFKA_CONTAINER"; then
        print_error "Kafka container is not running!"
        print_info "Start Kafka with: docker-compose up -d"
        exit 1
    fi
    print_info "Kafka is running ✓"
}

# Function to create test topic
create_topic() {
    print_header "Creating Test Topic"
    
    print_info "Creating topic: $TEST_TOPIC"
    docker exec "$KAFKA_CONTAINER" kafka-topics --create \
        --topic "$TEST_TOPIC" \
        --bootstrap-server kafka:9092 \
        --partitions 3 \
        --replication-factor 1 \
        --if-not-exists
    
    print_info "Topic created successfully ✓"
}

# Function to run producer performance test
test_producer() {
    print_header "Producer Performance Test"
    
    print_info "Test Parameters:"
    echo "  - Records: $NUM_RECORDS"
    echo "  - Record Size: ${RECORD_SIZE} bytes"
    echo "  - Topic: $TEST_TOPIC"
    echo ""
    
    print_info "Running producer test..."
    
    docker exec "$KAFKA_CONTAINER" kafka-producer-perf-test \
        --topic "$TEST_TOPIC" \
        --num-records "$NUM_RECORDS" \
        --record-size "$RECORD_SIZE" \
        --throughput "$THROUGHPUT" \
        --producer-props bootstrap.servers=kafka:9092 \
        | tee -a "$RESULT_FILE"
}

# Function to run consumer performance test
test_consumer() {
    print_header "Consumer Performance Test"
    
    print_info "Running consumer test..."
    
    docker exec "$KAFKA_CONTAINER" kafka-consumer-perf-test \
        --topic "$TEST_TOPIC" \
        --messages "$NUM_RECORDS" \
        --bootstrap-server kafka:9092 \
        --threads "$NUM_THREADS" \
        --timeout 60000 \
        | tee -a "$RESULT_FILE"
}

# Function to test end-to-end latency
test_latency() {
    print_header "End-to-End Latency Test"
    
    print_info "Testing latency with 10000 messages..."
    
    docker exec "$KAFKA_CONTAINER" kafka-run-class \
        kafka.tools.EndToEndLatency \
        kafka:9092 \
        "$TEST_TOPIC" \
        10000 \
        1 \
        1024 \
        | tee -a "$RESULT_FILE"
}

# Function to show topic statistics
show_topic_stats() {
    print_header "Topic Statistics"
    
    print_info "Getting topic details..."
    docker exec "$KAFKA_CONTAINER" kafka-topics \
        --describe \
        --topic "$TEST_TOPIC" \
        --bootstrap-server kafka:9092
}

# Function to monitor resource usage
monitor_resources() {
    print_header "Resource Usage"
    
    print_info "Docker container stats:"
    docker stats --no-stream "$KAFKA_CONTAINER" zookeeper
}

# Function to cleanup
cleanup() {
    print_header "Cleanup"
    
    read -p "Do you want to delete the test topic? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deleting topic: $TEST_TOPIC"
        docker exec "$KAFKA_CONTAINER" kafka-topics --delete \
            --topic "$TEST_TOPIC" \
            --bootstrap-server kafka:9092
        print_info "Topic deleted ✓"
    fi
}

# Function to run all tests
run_all_tests() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════╗"
    echo "║   Kafka Performance Testing Suite     ║"
    echo "║        MacOS Edition                  ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
    
    {
        echo "Kafka Performance Test Results"
        echo "Date: $(date)"
        echo "System: $(uname -a)"
        echo "========================================"
        echo ""
    } | tee "$RESULT_FILE"
    
    check_kafka
    create_topic
    
    print_info "Starting performance tests..."
    sleep 2
    
    test_producer
    sleep 2
    
    test_consumer
    sleep 2
    
    test_latency
    
    show_topic_stats
    monitor_resources
    
    print_header "Test Complete!"
    print_info "Results saved to: $RESULT_FILE"
    
    cleanup
}

# Menu
show_menu() {
    echo -e "\n${BLUE}Kafka Performance Test Menu${NC}"
    echo "1) Run All Tests"
    echo "2) Producer Test Only"
    echo "3) Consumer Test Only"
    echo "4) Latency Test Only"
    echo "5) Create Test Topic"
    echo "6) Show Topic Stats"
    echo "7) Monitor Resources"
    echo "8) Cleanup (Delete Topic)"
    echo "9) Exit"
    echo ""
    read -p "Select option: " choice
    
    case $choice in
        1) run_all_tests ;;
        2) check_kafka && create_topic && test_producer ;;
        3) check_kafka && test_consumer ;;
        4) check_kafka && create_topic && test_latency ;;
        5) check_kafka && create_topic ;;
        6) check_kafka && show_topic_stats ;;
        7) monitor_resources ;;
        8) cleanup ;;
        9) exit 0 ;;
        *) print_error "Invalid option" && show_menu ;;
    esac
}

# Main
if [ "$1" == "auto" ]; then
    run_all_tests
else
    show_menu
fi