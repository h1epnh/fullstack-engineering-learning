#!/bin/bash

# Elasticsearch endpoint
ELASTICSEARCH_URL="http://localhost:9200"
INDEX_NAME="kubernetes-$(date +%Y.%m.%d)"

# Generate log entries and send to Elasticsearch
while true; do
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
  LOG_ENTRY="{\"@timestamp\": \"$TIMESTAMP\", \"message\": \"This is a simulated log entry\"}"
  curl -X POST "$ELASTICSEARCH_URL/$INDEX_NAME/_doc" -H 'Content-Type: application/json' -d "$LOG_ENTRY"
  sleep 1
done