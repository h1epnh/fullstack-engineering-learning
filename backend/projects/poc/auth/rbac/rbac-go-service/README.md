# TESTING

## Login
curl -X POST http://localhost:8080/login -H "Content-Type: application/json" -d '{"username":"john_doe","password":"password123"}'

## Access

curl -X GET "http://localhost:8080/access?action=write" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiJ1c2VySUQiLCJleHAiOjE3Mzg3Mzc3Mzd9.rBY0AD_E4vwzqULCEXpEIrZYf45RMcFbJ4jiTwn1Whw"