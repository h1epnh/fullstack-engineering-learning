import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '1m',
};

export default function () {
  const payload = JSON.stringify({ username: 'user', password: 'pass' });
  const headers = { 'Content-Type': 'application/json' };

  const res = http.post('https://auth.test.com/login', payload, { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'token is returned': (r) => r.json('token') !== undefined,
  });

  sleep(1); // Simulate user think time
}
