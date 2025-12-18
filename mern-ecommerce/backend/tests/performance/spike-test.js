import http from 'k6/http';
import { check, sleep } from 'k6';

// Spike test - Sudden surge in traffic
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Normal load
    { duration: '10s', target: 500 },  // Sudden spike!
    { duration: '1m', target: 500 },   // Hold spike
    { duration: '30s', target: 50 },   // Drop back to normal
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // More lenient during spike
    http_req_failed: ['rate<0.15'],    // Allow higher error rate during spike
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
  const response = http.get(`${BASE_URL}/products`);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
