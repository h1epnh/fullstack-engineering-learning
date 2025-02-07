

# Install CircleCI
kubectl apply -f circleci-postgres.yaml 
kubectl apply -f circleci-server.yaml

brew install circleci
circleci setup

helm repo add stable https://charts.helm.sh/stable
helm repo update

https://app.circleci.com/pipelines/circleci/6NrRtGvt89uRD7tbEtAdNd

