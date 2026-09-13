import http from 'k6/http';
import { check, sleep } from 'k6';

export default function() {
  let response = http.get('http://localhost:8080/api/users');
  
  check(response, {
    'status is 200': (r) => r.status === 200
  });

  sleep(1);
}

export const options = {
  stages: [
    { duration: '10s', target: 1000 }, // ramp up users over 30 secs
  ]
};

