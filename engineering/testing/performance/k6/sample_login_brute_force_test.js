import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  iterations: 50,
};

const usernames = ['admin', 'user1'];
const passwords = ['1234', 'password'];

export default function () {
  for (const username of usernames) {
    for (const password of passwords) {
      const payload = JSON.stringify({ username, password });
      const headers = { 'Content-Type': 'application/json' };

      const res = http.post('https://auth.test.com/login', payload, { headers });

      check(res, {
        'status is 200': (r) => r.status === 200,
        'login failed': (r) => !r.body.includes('Invalid credentials'),
      });

      if (res.status === 200) {k6 
        console.log(`Successful login with ${username}:${password}`);
        return;
      }
    }
  }
}
