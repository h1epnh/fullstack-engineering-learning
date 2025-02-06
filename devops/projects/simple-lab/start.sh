#!/bin/bash

# Start the Node.js application service
minikube service node-app-service &

# Port forward Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090 &

# Port forward Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000 &

# Port forward Elasticsearch
kubectl port-forward -n kube-system svc/elasticsearch 9200:9200 &

# Wait for all background processes to complete
wait