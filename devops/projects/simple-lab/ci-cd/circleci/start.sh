#!/bin/bash

kubectl apply -f ./circleci-postgres.yaml &
kubectl apply -f ./circleci-server.yaml