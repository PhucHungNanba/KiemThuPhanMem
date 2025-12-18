import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Stress test - Push system to its limits
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Warm up
    { duration: '2m', target: 300 },   // Ramp up to target load
    { duration: '3m', target: 300 },   // Sustained load
    { duration: '2m', target: 500 },   // Spike to 500 users
    { duration: '1m', target: 500 },   // Hold spike
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const errorRate = new Rate('errors');

export default function () {
  // Random API endpoint selection
  const endpoints = [
    `${BASE_URL}/products`,
    `${BASE_URL}/brands`,
    `${BASE_URL}/categories`,
    `${BASE_URL}/products?page=1&limit=20`,
    `${BASE_URL}/products?sort=price&order=asc`,
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(endpoint);

  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!success);
  sleep(0.5);
}
