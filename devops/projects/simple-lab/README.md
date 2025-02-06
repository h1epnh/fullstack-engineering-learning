# Build and Push Docker Image

cd app
docker build -t changtraisitinh/node-app .
docker push changtraisitinh/node-app


# Deploy Application to Kubernetes

kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Set Up Monitoring and Logging

## Prometheus
kubectl create namespace monitoring
kubectl apply -f k8s/prometheus/prometheus-config.yaml
kubectl apply -f k8s/prometheus/prometheus-deployment.yaml
kubectl apply -f k8s/prometheus/prometheus-service.yaml

## Grafana
kubectl apply -f k8s/grafana/grafana-config.yaml
kubectl apply -f k8s/grafana/grafana-deployment.yaml
kubectl apply -f k8s/grafana/grafana-service.yaml

## Fluentd
kubectl apply -f k8s/fluentd/fluentd-config.yaml
kubectl apply -f k8s/fluentd/fluentd-deployment.yaml

## Elastic Search
kubectl apply -f k8s/elasticsearch/elasticsearch-deployment.yaml
kubectl apply -f k8s/elasticsearch/elasticsearch-service.yaml


# Access the Services

minikube service node-app-service
kubectl port-forward -n monitoring svc/prometheus 9090:9090
kubectl port-forward -n monitoring svc/grafana 3000:3000
kubectl port-forward -n kube-system svc/elasticsearch 9200:9200

# Simulate Node Failure
minikube ssh
sudo systemctl stop kubelet

# Verify System Health
kubectl get pods
kubectl get services


# Setup Grafana
Connection URL: http://elasticsearch.kube-system.svc.cluster.local:9200


# Check Data

curl "http://localhost:9200/kubernetes-*/_search?pretty"