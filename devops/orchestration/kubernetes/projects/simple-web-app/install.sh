# Build the image
docker build -t changtraisitinh/web-app:1.0 .

# Push the image to Docker Hub
docker push changtraisitinh/web-app:1.0


# Create namespace (optional but recommended)
# kubectl create namespace web-app

# Apply configurations
kubectl delete -f deployment.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml