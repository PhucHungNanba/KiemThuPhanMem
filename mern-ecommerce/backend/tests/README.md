# Hệ thống Kiểm thử MERN Ecommerce

## Tổng quan
Hệ thống kiểm thử toàn diện cho dự án MERN Ecommerce bao gồm:
- **Unit Tests**: Kiểm thử từng component độc lập với mock dependencies
- **Integration Tests (Black-Box)**: Áp dụng equivalence partitioning và boundary analysis
- **E2E Tests (Use Case)**: Kiểm thử theo flow nghiệp vụ thực tế
- **Performance Tests**: Sử dụng K6 để test với 100-300 concurrent users

---

## Cấu trúc thư mục

```
backend/
├── tests/
│   ├── setup.js                          # Cấu hình test environment
│   ├── fixtures/
│   │   └── testData.js                   # Test data generators & boundary values
│   ├── unit/
│   │   └── controllers/
│   │       ├── Auth.test.js              # Unit tests cho Auth với equivalence classes
│   │       └── Product.test.js           # Unit tests cho Product với boundary tests
│   ├── integration/
│   │   └── api/
│   │       └── Product.test.js           # Black-box testing với boundary analysis
│   ├── e2e/
│   │   └── userJourney.test.js           # Use case tests - complete flows
│   └── performance/
│       ├── load-test.js                  # K6 load test (100-300 users)
│       ├── stress-test.js                # K6 stress test (up to 500 users)
│       └── spike-test.js                 # K6 spike test
├── .env.test                             # Test environment configuration
└── jest.config.js                        # Jest configuration
```

---

## Cài đặt

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Cài đặt K6 (cho Performance Testing)

#### Windows (Chocolatey):
```powershell
choco install k6
```

#### Windows (MSI Installer):
Tải từ: https://dl.k6.io/msi/k6-latest-amd64.msi

#### macOS:
```bash
brew install k6
```

#### Linux:
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

---

## Chạy Tests

### Unit Tests
Test từng controller/service độc lập với mock dependencies:
```bash
npm run test:unit
```

**Đặc điểm:**
- Mock tất cả dependencies (database, external services)
- Test logic nghiệp vụ độc lập
- Fast execution

**Ví dụ test cases:**
- ✓ Should create product successfully
- ✓ Should handle validation errors
- ✓ Should accept minimum valid price (boundary)
- ✓ Should reject negative price (boundary)

### Integration Tests (Black-Box)
Test API endpoints với database thực (in-memory):
```bash
npm run test:integration
```

**Kỹ thuật áp dụng:**

#### 1. Equivalence Partitioning
Chia input thành các nhóm tương đương:
- **Valid email classes**: user@example.com, test.user@domain.co.uk
- **Invalid email classes**: @example.com, user@, invalid-email

#### 2. Boundary Value Analysis
Test giá trị biên của các trường:

| Field | Below Min | Min | Just Above | Normal | Just Below Max | Max | Above Max |
|-------|-----------|-----|------------|--------|----------------|-----|-----------|
| Price | -1 | 0 | 0.01 | 100 | 999999.99 | 1000000 | 1000001 |
| Stock | -1 | 0 | 1 | 50 | 9999 | 10000 | 10001 |
| Rating | -1 | 0 | 0.1 | 3 | 4.9 | 5 | 5.1 |
| Discount | -1 | 0 | 1 | 25 | 99 | 100 | 101 |

**Test cases tự động:**
- ✓ Should accept price at minimum (0)
- ✓ Should reject negative price
- ✓ Should accept discount at 100%
- ✓ Should reject discount above 100%

### E2E Tests (Use Case)
Test theo flow nghiệp vụ hoàn chỉnh:
```bash
npm run test:e2e
```

**Use Cases được test:**

#### Use Case 1: Complete Customer Journey
1. ✓ User registers account
2. ✓ User logs in
3. ✓ User browses products
4. ✓ User views product details
5. ✓ User adds product to cart
6. ✓ User updates cart quantity
7. ✓ User adds delivery address
8. ✓ User proceeds to checkout
9. ✓ User completes order
10. ✓ User views order confirmation

#### Use Case 2: Product Search and Filter
1. ✓ User searches all products
2. ✓ User filters by category
3. ✓ User filters by brand
4. ✓ User sorts by price
5. ✓ User applies pagination

#### Use Case 3: Admin Product Management
1. ✓ Admin creates product
2. ✓ Admin updates product
3. ✓ Admin deletes product
4. ✓ Admin views orders
5. ✓ Admin updates order status

### Chạy tất cả tests
```bash
npm test
```

### Chạy tests với watch mode (development)
```bash
npm run test:watch
```

---

## Performance Testing với K6

### Load Test (100-300 concurrent users)
```bash
npm run test:perf
```

hoặc trực tiếp:
```bash
k6 run tests/performance/load-test.js
```

**Cấu hình:**
```javascript
stages: [
  { duration: '30s', target: 50 },   // Ramp up
  { duration: '1m', target: 100 },   // 100 users
  { duration: '1m', target: 200 },   // 200 users
  { duration: '1m', target: 300 },   // 300 users (peak)
  { duration: '1m', target: 200 },   // Ramp down
  { duration: '30s', target: 0 },
]
```

**Thresholds:**
- ✓ p(95) < 500ms: 95% requests phải dưới 500ms
- ✓ p(99) < 1000ms: 99% requests phải dưới 1s
- ✓ error rate < 5%

**Scenarios tested:**
- 40% - Browse products
- 30% - Search and filter
- 15% - View product details
- 15% - Complete user journey

### Stress Test (up to 500 users)
```bash
k6 run tests/performance/stress-test.js
```

Đẩy hệ thống đến giới hạn để tìm breaking point.

### Spike Test (sudden traffic surge)
```bash
k6 run tests/performance/spike-test.js
```

Test khả năng xử lý đột tăng traffic.

### Chạy với custom URL
```bash
BASE_URL=http://production-url.com k6 run tests/performance/load-test.js
```

---

## Coverage Report

Xem coverage report sau khi chạy tests:
```bash
npm test
```

Report được tạo tại: `backend/coverage/index.html`

**Coverage thresholds:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

---

## Test Data Management

### Fixtures
File `tests/fixtures/testData.js` cung cấp:

#### Data Generators:
```javascript
generateUser()      // Tạo random user
generateProduct()   // Tạo random product
generateAddress()   // Tạo random address
generateOrder()     // Tạo random order
```

#### Boundary Values:
```javascript
boundaryValues.price
boundaryValues.stock
boundaryValues.rating
boundaryValues.discountPercentage
```

#### Equivalence Classes:
```javascript
equivalenceClasses.email.valid
equivalenceClasses.email.invalid
equivalenceClasses.password.valid
equivalenceClasses.password.invalid
```

### Test Environment
File `.env.test` chứa cấu hình riêng cho test:
- In-memory MongoDB
- Test JWT secret
- Mock email service
- Reduced bcrypt rounds (faster tests)

---

## CI/CD Integration

### GitHub Actions
Tạo file `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test
      - run: cd backend && npm run test:unit
      - run: cd backend && npm run test:integration
      
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: grafana/setup-k6-action@v1
      - run: cd backend && npm start &
      - run: sleep 10
      - run: k6 run backend/tests/performance/load-test.js
```

---

## Best Practices

### 1. Unit Tests
- ✓ Mock tất cả dependencies
- ✓ Test một function/method tại một thời điểm
- ✓ Sử dụng descriptive test names
- ✓ Follow AAA pattern (Arrange, Act, Assert)

### 2. Integration Tests
- ✓ Sử dụng in-memory database
- ✓ Clean database sau mỗi test
- ✓ Test API contracts
- ✓ Áp dụng boundary value analysis

### 3. E2E Tests
- ✓ Test complete user flows
- ✓ Sử dụng realistic test data
- ✓ Test happy path và error scenarios
- ✓ Keep tests independent

### 4. Performance Tests
- ✓ Test trong môi trường giống production
- ✓ Monitor metrics (response time, error rate, throughput)
- ✓ Set realistic thresholds
- ✓ Test different scenarios

---

## Troubleshooting

### Tests hanging?
```bash
# Sử dụng detectOpenHandles
npm test -- --detectOpenHandles
```

### Port already in use?
Kiểm tra và kill process:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### MongoDB connection issues?
Test sử dụng in-memory MongoDB, không cần MongoDB server chạy.

### K6 not found?
Cài đặt K6 theo hướng dẫn ở phần "Cài đặt" trên.

---

## Metrics và Reporting

### Jest Coverage
```bash
npm test -- --coverage
```

Xem report: `coverage/lcov-report/index.html`

### K6 Results
K6 tự động generate:
- `performance-summary.json` - Raw metrics
- `performance-report.html` - HTML report
- Console output - Real-time metrics

---

## Tài liệu tham khảo

- [Jest Documentation](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [K6 Documentation](https://k6.io/docs/)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Software Testing Techniques](https://www.guru99.com/software-testing-techniques.html)

---

## Liên hệ và đóng góp

Nếu có vấn đề hoặc đề xuất cải thiện, vui lòng tạo issue hoặc pull request.

---

## License

MIT
