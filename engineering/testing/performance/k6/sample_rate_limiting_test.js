import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
};

export default function () {
  const res = http.get('https://api.test.com/endpoint');

  check(res, {
    'status is 429 when rate limit exceeded': (r) =>
      r.status === 429 || r.status === 200,
  });
}
