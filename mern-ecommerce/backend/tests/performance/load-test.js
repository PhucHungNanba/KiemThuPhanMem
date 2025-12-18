import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 200 },   // Ramp up to 200 users
    { duration: '1m', target: 300 },   // Peak at 300 users
    { duration: '1m', target: 200 },   // Ramp down to 200 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests must complete below 500ms, 99% below 1s
    http_req_failed: ['rate<0.05'], // Error rate must be less than 5%
    errors: ['rate<0.1'], // Custom error rate must be less than 10%
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// Test data
const testProducts = [];
const testUsers = [];

export function setup() {
  // Create test data (products)
  console.log('Setting up test data...');
  
  const productsResponse = http.get(`${BASE_URL}/products?limit=50`);
  if (productsResponse.status === 200) {
    const products = JSON.parse(productsResponse.body);
    return { products };
  }
  
  return { products: [] };
}

export default function (data) {
  // Simulate different user behaviors
  const scenario = Math.random();

  if (scenario < 0.4) {
    // 40% - Browse products
    browseProducts(data);
  } else if (scenario < 0.7) {
    // 30% - Search and filter products
    searchAndFilterProducts();
  } else if (scenario < 0.85) {
    // 15% - View product details
    viewProductDetails(data);
  } else {
    // 15% - Complete user journey (register, browse, add to cart)
    completeUserJourney(data);
  }

  sleep(1); // Think time between actions
}

function browseProducts(data) {
  group('Browse Products', () => {
    const page = Math.floor(Math.random() * 5) + 1;
    
    const response = http.get(`${BASE_URL}/products?page=${page}&limit=12`, {
      tags: { name: 'BrowseProducts' },
    });

    const success = check(response, {
      'browse products - status 200': (r) => r.status === 200,
      'browse products - has products': (r) => {
        const body = JSON.parse(r.body);
        return Array.isArray(body) && body.length > 0;
      },
      'browse products - response time < 500ms': (r) => r.timings.duration < 500,
    });

    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    
    if (success) {
      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
    }
  });
}

function searchAndFilterProducts() {
  group('Search and Filter Products', () => {
    const categories = ['Electronics', 'Clothing', 'Books', 'Sports'];
    const brands = ['Nike', 'Samsung', 'Apple', 'Adidas'];
    const sorts = ['price', 'rating', 'title'];
    const orders = ['asc', 'desc'];

    // Filter by category
    const category = categories[Math.floor(Math.random() * categories.length)];
    const response1 = http.get(`${BASE_URL}/products?category=${category}`, {
      tags: { name: 'FilterByCategory' },
    });

    check(response1, {
      'filter by category - status 200': (r) => r.status === 200,
      'filter by category - response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(0.5);

    // Filter by brand
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const response2 = http.get(`${BASE_URL}/products?brand=${brand}`, {
      tags: { name: 'FilterByBrand' },
    });

    check(response2, {
      'filter by brand - status 200': (r) => r.status === 200,
      'filter by brand - response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(0.5);

    // Sort products
    const sort = sorts[Math.floor(Math.random() * sorts.length)];
    const order = orders[Math.floor(Math.random() * orders.length)];
    const response3 = http.get(`${BASE_URL}/products?sort=${sort}&order=${order}`, {
      tags: { name: 'SortProducts' },
    });

    check(response3, {
      'sort products - status 200': (r) => r.status === 200,
      'sort products - response time < 500ms': (r) => r.timings.duration < 500,
    });

    responseTime.add(response1.timings.duration);
    responseTime.add(response2.timings.duration);
    responseTime.add(response3.timings.duration);
  });
}

function viewProductDetails(data) {
  group('View Product Details', () => {
    if (data.products && data.products.length > 0) {
      const product = data.products[Math.floor(Math.random() * data.products.length)];
      
      const response = http.get(`${BASE_URL}/products/${product._id}`, {
        tags: { name: 'ViewProductDetails' },
      });

      const success = check(response, {
        'view product - status 200': (r) => r.status === 200,
        'view product - has details': (r) => {
          const body = JSON.parse(r.body);
          return body.title && body.price;
        },
        'view product - response time < 300ms': (r) => r.timings.duration < 300,
      });

      errorRate.add(!success);
      responseTime.add(response.timings.duration);
      
      if (success) {
        successfulRequests.add(1);
      } else {
        failedRequests.add(1);
      }
    }
  });
}

function completeUserJourney(data) {
  group('Complete User Journey', () => {
    const email = `user${Date.now()}${Math.random()}@example.com`;
    const password = 'TestPassword123!';

    // 1. Register
    const signupPayload = JSON.stringify({
      name: `Test User ${Date.now()}`,
      email: email,
      password: password,
    });

    const signupResponse = http.post(`${BASE_URL}/auth/signup`, signupPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'UserSignup' },
    });

    check(signupResponse, {
      'signup - status 200 or 201': (r) => r.status === 200 || r.status === 201,
      'signup - response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    sleep(1);

    // 2. Login
    const loginPayload = JSON.stringify({
      email: email,
      password: password,
    });

    const loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'UserLogin' },
    });

    const loginSuccess = check(loginResponse, {
      'login - status 200': (r) => r.status === 200,
      'login - has token': (r) => r.headers['Set-Cookie'] !== undefined,
      'login - response time < 800ms': (r) => r.timings.duration < 800,
    });

    if (loginSuccess) {
      // Extract token from cookies
      const cookies = loginResponse.headers['Set-Cookie'];
      
      sleep(1);

      // 3. Browse products
      const browseResponse = http.get(`${BASE_URL}/products?page=1&limit=10`, {
        tags: { name: 'BrowseAfterLogin' },
      });

      check(browseResponse, {
        'browse after login - status 200': (r) => r.status === 200,
      });

      sleep(1);

      // 4. View brands
      const brandsResponse = http.get(`${BASE_URL}/brands`, {
        tags: { name: 'ViewBrands' },
      });

      check(brandsResponse, {
        'view brands - status 200': (r) => r.status === 200,
      });

      sleep(1);

      // 5. View categories
      const categoriesResponse = http.get(`${BASE_URL}/categories`, {
        tags: { name: 'ViewCategories' },
      });

      check(categoriesResponse, {
        'view categories - status 200': (r) => r.status === 200,
      });

      successfulRequests.add(1);
    } else {
      failedRequests.add(1);
    }

    responseTime.add(signupResponse.timings.duration);
    responseTime.add(loginResponse.timings.duration);
  });
}

export function teardown(data) {
  console.log('Performance test completed!');
  console.log('Test Summary:');
  console.log(`  - Total products used: ${data.products.length}`);
}

// Handle summary to generate reports
export function handleSummary(data) {
  return {
    'performance-report.html': htmlReport(data),
    'performance-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  // Simple text summary
  return `
Performance Test Summary
========================
Duration: ${data.state.testRunDurationMs}ms
VUs: ${data.metrics.vus.values.max} (max)
Requests: ${data.metrics.http_reqs.values.count}
Failed: ${data.metrics.http_req_failed.values.rate * 100}%
Avg Response Time: ${data.metrics.http_req_duration.values.avg}ms
95th Percentile: ${data.metrics.http_req_duration.values['p(95)']}ms
99th Percentile: ${data.metrics.http_req_duration.values['p(99)']}ms
  `;
}

function htmlReport(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>K6 Performance Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; }
    .pass { color: green; }
    .fail { color: red; }
  </style>
</head>
<body>
  <h1>Performance Test Report</h1>
  <div class="metric">
    <h2>Summary</h2>
    <p>Total Requests: ${data.metrics.http_reqs.values.count}</p>
    <p>Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</p>
    <p>Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms</p>
    <p>95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms</p>
    <p>99th Percentile: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms</p>
  </div>
</body>
</html>`;
}
