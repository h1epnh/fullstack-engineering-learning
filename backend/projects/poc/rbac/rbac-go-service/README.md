# TESTING

## Login
curl -X POST http://localhost:8080/login -H "Content-Type: application/json" -d '{"username":"john_doe","password":"password123"}'

## Access

curl -X GET "http://localhost:8080/access?action=write" -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIxIiwiZXhwIjoxNzM4NjU2NTE1fQ.a_QLEv5bwhTiBxMZKZHpZKdpum821s5DZaSL0XxM250"