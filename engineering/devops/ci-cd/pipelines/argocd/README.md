# install
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8080:8080

# get password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo


# login
argocd login localhost:8080 --username admin --password V3ctX8cutiPNweIl --insecure

argocd repo add https://github.com/changtraisitinh/fullstack-engineering-learning.git \
  --username changtraisitinh \
  --password 'asdsadsad'



# setup pipeline


argocd app create simple-app \
  --repo https://github.com/changtraisitinh/fullstack-engineering-learning.git \
  --path ./devops/projects/simple-lab/k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default