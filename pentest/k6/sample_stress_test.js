import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 500 },  // Stay at 500 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
};

export default function () {
  const res = http.get('https://api.test.com/endpoint');
  sleep(1);
}
