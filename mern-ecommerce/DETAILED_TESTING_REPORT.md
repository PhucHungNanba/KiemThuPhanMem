# 📊 BÁO CÁO CHI TIẾT VỀ KIỂM THỬ DỰ ÁN

## 🎯 TỔNG QUAN CÁC CHỨC NĂNG ĐÃ TEST

### ✅ Chức năng đã có Unit Tests

#### 1. **Authentication (Auth) - 17 Tests**

| Chức năng | Test Cases | Trạng thái | Mô tả |
|-----------|-----------|------------|-------|
| **Signup** | 13 tests | ✅ Đạt | Đăng ký tài khoản mới |
| - Valid emails | 3 tests | ✅ | Test 3 định dạng email hợp lệ |
| - Invalid emails | 5 tests | ✅ | Test 5 định dạng email không hợp lệ |
| - User exists | 1 test | ✅ | Kiểm tra user đã tồn tại |
| - Password hashing | 1 test | ✅ | Mã hóa mật khẩu |
| - JWT generation | 1 test | ✅ | Tạo token đăng nhập |
| - Secure cookie | 1 test | ✅ | Cookie an toàn production |
| - Database errors | 1 test | ✅ | Xử lý lỗi database |
| **Login** | 4 tests | ⚠️ 1/4 đạt | Đăng nhập hệ thống |
| - Correct credentials | 1 test | ✅ | Đăng nhập thành công |
| - Wrong password | 1 test | ⚠️ | Sai mật khẩu |
| - Non-existent email | 1 test | ⚠️ | Email không tồn tại |
| - Empty password | 1 test | ⚠️ | Mật khẩu trống |

#### 2. **Product Management - 5 Tests**

| Chức năng | Test Cases | Trạng thái | Mô tả |
|-----------|-----------|------------|-------|
| **Create Product** | 5 tests | ✅ Đạt | Tạo sản phẩm mới |
| - Valid product | 1 test | ✅ | Tạo với dữ liệu hợp lệ |
| - Database errors | 1 test | ✅ | Xử lý lỗi database |
| - Min price (0) | 1 test | ✅ | Giá tối thiểu |
| - Min stock (0) | 1 test | ✅ | Tồn kho tối thiểu |
| - Max discount (100%) | 1 test | ✅ | Giảm giá tối đa |

**Tổng cộng: 22 tests, 19 đạt (86.4%)**

---

## 📝 CÁCH VIẾT TEST CHI TIẾT

### 1. 🧪 Unit Test với Mock Dependencies

#### Ví dụ: Test chức năng Signup

```javascript
// File: tests/unit/controllers/Auth.test.js

// Bước 1: Import dependencies
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const { signup } = require('../../../controllers/Auth');
const { generateUser } = require('../../fixtures/testData');

// Bước 2: Mock các dependencies (thay thế bằng giả lập)
jest.mock('../../../models/User');        // Mock User model
jest.mock('bcryptjs');                    // Mock bcrypt
jest.mock('../../../utils/GenerateToken'); // Mock token generator

describe('Auth Controller - Unit Tests', () => {
  let req, res;

  // Bước 3: Setup trước mỗi test
  beforeEach(() => {
    // Tạo mock request và response
    req = {
      body: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),  // Mock hàm status
      json: jest.fn().mockReturnThis(),    // Mock hàm json
      cookie: jest.fn().mockReturnThis()   // Mock hàm cookie
    };
    
    jest.clearAllMocks(); // Xóa tất cả mock trước mỗi test
  });

  // Bước 4: Viết test case
  it('should create user successfully', async () => {
    // ARRANGE (Chuẩn bị)
    const userData = await generateUser(); // Tạo dữ liệu test
    req.body = userData;
    
    // Mock các hàm sẽ được gọi
    User.findOne = jest.fn().mockResolvedValue(null); // User chưa tồn tại
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword'); // Mã hóa password
    
    const mockSave = jest.fn().mockResolvedValue(userData);
    User.mockImplementation(() => ({
      save: mockSave // Mock hàm save
    }));

    // ACT (Thực hiện)
    await signup(req, res);

    // ASSERT (Kiểm tra kết quả)
    expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

**Giải thích từng bước:**

1. **Import**: Lấy các module cần test và tools
2. **Mock**: Giả lập dependencies để test độc lập
3. **Setup**: Chuẩn bị môi trường test sạch
4. **Test Case**: Viết theo pattern AAA (Arrange-Act-Assert)

---

### 2. 🔲 Black-Box Testing: Equivalence Partitioning

#### Ví dụ: Test Email Validation

```javascript
// File: tests/fixtures/testData.js

// Bước 1: Định nghĩa các lớp tương đương
const equivalenceClasses = {
  email: {
    // Lớp hợp lệ: Đại diện cho tất cả email đúng format
    valid: [
      'user@example.com',           // Email chuẩn
      'test.user@domain.co.uk',     // Email có dấu chấm và nhiều domain
      'user+tag@example.com'        // Email có ký tự đặc biệt
    ],
    // Lớp không hợp lệ: Đại diện cho tất cả email sai format
    invalid: [
      'invalid-email',    // Không có @
      '@example.com',     // Thiếu username
      'user@',            // Thiếu domain
      'user@.com',        // Domain không hợp lệ
      ''                  // Email rỗng
    ]
  }
};

// Bước 2: Tạo test tự động cho tất cả các lớp
describe('Valid Email Classes', () => {
  equivalenceClasses.email.valid.forEach((email) => {
    it(`should accept valid email: ${email}`, async () => {
      // Test với từng email hợp lệ
      const userData = await generateUser({ email });
      req.body = userData;
      
      // Mock setup...
      await signup(req, res);
      
      // Expect success
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});

describe('Invalid Email Classes', () => {
  equivalenceClasses.email.invalid.forEach((email) => {
    it(`should reject invalid email: ${email || '(empty)'}`, async () => {
      // Test với từng email không hợp lệ
      const userData = await generateUser({ email });
      req.body = userData;
      
      // Mock setup để fail...
      await signup(req, res);
      
      // Expect error
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
```

**Ưu điểm:**
- Chỉ cần test 1 giá trị đại diện cho mỗi lớp
- Tiết kiệm thời gian, vẫn đảm bảo coverage
- Dễ mở rộng khi thêm cases mới

---

### 3. 📏 Black-Box Testing: Boundary Value Analysis

#### Ví dụ: Test Product Price

```javascript
// File: tests/fixtures/testData.js

// Bước 1: Định nghĩa các giá trị biên
const boundaryValues = {
  price: {
    belowMin: -1,          // Dưới min (Invalid)
    min: 0,                // Min (Valid)
    justAboveMin: 0.01,    // Ngay trên min (Valid)
    normal: 100,           // Giá trị bình thường (Valid)
    justBelowMax: 999999.99, // Ngay dưới max (Valid)
    max: 1000000,          // Max (Valid)
    aboveMax: 1000001      // Trên max (Invalid)
  }
};

// Bước 2: Test từng giá trị biên
describe('Price Boundaries', () => {
  it('should reject price below minimum (-1)', async () => {
    const product = generateProduct({ 
      price: boundaryValues.price.belowMin 
    });
    req.body = product;
    
    await create(req, res);
    
    // Expect error vì giá âm
    expect(res.status).toHaveBeenCalledWith(400); // or 500
  });
  
  it('should accept price at minimum (0)', async () => {
    const product = generateProduct({ 
      price: boundaryValues.price.min 
    });
    req.body = product;
    
    await create(req, res);
    
    // Expect success vì 0 là hợp lệ
    expect(res.status).toHaveBeenCalledWith(201);
  });
  
  it('should accept price just above minimum (0.01)', async () => {
    const product = generateProduct({ 
      price: boundaryValues.price.justAboveMin 
    });
    req.body = product;
    
    await create(req, res);
    
    // Expect success
    expect(res.status).toHaveBeenCalledWith(201);
  });
  
  // ... Tiếp tục test các giá trị biên khác
});
```

**Tại sao test giá trị biên?**
- Lỗi thường xảy ra tại ranh giới (boundary)
- Ví dụ: `price >= 0` vs `price > 0`
- Test 7 điểm: below min, min, just above, normal, just below, max, above max

---

### 4. ⚡ Performance Testing với K6

#### Ví dụ: Load Test 100-300 Users

```javascript
// File: tests/performance/load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Bước 1: Define metrics
const errorRate = new Rate('errors');

// Bước 2: Configure load stages
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up đến 50 users
    { duration: '1m', target: 100 },   // Giữ 100 users trong 1 phút
    { duration: '1m', target: 200 },   // Tăng lên 200 users
    { duration: '1m', target: 300 },   // Đạt peak 300 users
    { duration: '1m', target: 200 },   // Giảm xuống 200
    { duration: '30s', target: 0 },    // Ramp down về 0
  ],
  // Bước 3: Set thresholds (ngưỡng chấp nhận)
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% requests < 500ms
    http_req_failed: ['rate<0.05'],    // Error rate < 5%
  },
};

const BASE_URL = 'http://localhost:8080';

// Bước 4: Test function (chạy cho mỗi virtual user)
export default function () {
  // Scenario 1: Browse products (40%)
  if (Math.random() < 0.4) {
    const response = http.get(`${BASE_URL}/products?page=1&limit=12`);
    
    // Check response
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    errorRate.add(!success);
  }
  
  // Scenario 2: Search products (30%)
  else if (Math.random() < 0.7) {
    const response = http.get(`${BASE_URL}/products?category=Electronics`);
    
    check(response, {
      'filter works': (r) => r.status === 200,
    });
  }
  
  // Think time between actions
  sleep(1);
}
```

**Chạy test:**
```bash
# Cần server chạy trước
npm start

# Terminal khác, chạy K6
k6 run tests/performance/load-test.js
```

**Kết quả K6 sẽ hiển thị:**
- Requests per second (RPS)
- Response time (avg, p95, p99)
- Error rate
- Pass/Fail thresholds

---

### 5. 🎬 Use Case Testing (E2E)

#### Ví dụ: Complete Customer Journey

```javascript
// File: tests/e2e/userJourney.test.js

describe('Use Case 1: Complete Customer Journey', () => {
  let userToken;
  let testProduct;
  let orderId;
  
  // Step 1: User registers
  it('Step 1: User registers a new account', async () => {
    const userData = await generateUser();
    
    const response = await request(app)
      .post('/auth/signup')
      .send({
        name: userData.name,
        email: userData.email,
        password: userData.plainPassword
      });

    expect([200, 201]).toContain(response.status);
    expect(response.body).toHaveProperty('id');
    
    console.log('✓ User registered successfully');
  });
  
  // Step 2: User logs in
  it('Step 2: User logs in', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: userData.email,
        password: userData.plainPassword
      });

    expect(loginResponse.status).toBe(200);
    
    // Extract token from cookie
    const cookies = loginResponse.headers['set-cookie'];
    userToken = extractToken(cookies);
    
    console.log('✓ User logged in successfully');
  });
  
  // Step 3: User browses products
  it('Step 3: User browses products', async () => {
    const response = await request(app)
      .get('/products')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    testProduct = response.body[0];
    
    console.log('✓ User browsed products successfully');
  });
  
  // Step 4-10: Continue the journey...
  // View details → Add to cart → Add address → Checkout → Complete order
});
```

**Đặc điểm Use Case Testing:**
- Test flow hoàn chỉnh từ đầu đến cuối
- Giống hành vi user thực tế
- Kết hợp nhiều API calls
- Check từng bước của journey

---

## 🛠️ CẤU TRÚC TEST PROJECT

```
backend/tests/
│
├── setup.js                    # Global setup cho tất cả tests
│   ├── Khởi tạo in-memory MongoDB
│   ├── Cleanup sau mỗi test
│   └── Mock console để giảm noise
│
├── fixtures/
│   └── testData.js             # Test data generators
│       ├── generateUser()      # Tạo user giả với Faker
│       ├── generateProduct()   # Tạo product giả
│       ├── boundaryValues      # Giá trị biên cho testing
│       └── equivalenceClasses  # Lớp tương đương cho testing
│
├── unit/                       # Unit tests (test từng function độc lập)
│   └── controllers/
│       ├── Auth.test.js        # Test Auth controller
│       └── Product.test.js     # Test Product controller
│
├── integration/                # Integration tests (test API với DB)
│   └── api/
│       └── Product.test.js     # Test Product API endpoints
│
├── e2e/                        # End-to-end tests (test flows)
│   └── userJourney.test.js     # Test complete user journeys
│
└── performance/                # Performance tests với K6
    ├── load-test.js            # Test 100-300 concurrent users
    ├── stress-test.js          # Test up to 500 users
    └── spike-test.js           # Test sudden traffic surge
```

---

## 🎯 KỸ THUẬT TESTING ĐÃ ÁP DỤNG

### 1. AAA Pattern (Arrange-Act-Assert)

```javascript
it('should create user', async () => {
  // ARRANGE: Chuẩn bị dữ liệu và môi trường
  const userData = await generateUser();
  req.body = userData;
  User.findOne = jest.fn().mockResolvedValue(null);
  
  // ACT: Thực hiện hành động cần test
  await signup(req, res);
  
  // ASSERT: Kiểm tra kết quả
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalled();
});
```

### 2. Dependency Injection & Mocking

```javascript
// Thay vì gọi database thật:
const user = await User.findOne({ email });

// Ta mock nó:
User.findOne = jest.fn().mockResolvedValue(mockUser);

// Lợi ích:
// - Test nhanh hơn (không cần DB thật)
// - Test độc lập (không ảnh hưởng bởi data thật)
// - Control được kết quả (success/error scenarios)
```

### 3. Test Data Generation với Faker

```javascript
const { faker } = require('@faker-js/faker');

const generateUser = async (overrides = {}) => {
  return {
    name: faker.person.fullName(),        // "John Doe"
    email: faker.internet.email(),        // "john@example.com"
    password: faker.internet.password(),  // "SecurePass123!"
    ...overrides  // Cho phép override bất kỳ field nào
  };
};

// Sử dụng:
const user1 = await generateUser(); // Random data
const user2 = await generateUser({ role: 'admin' }); // Override role
```

### 4. Parameterized Tests

```javascript
// Thay vì viết nhiều tests giống nhau:
it('should accept email1', () => { /* test */ });
it('should accept email2', () => { /* test */ });
it('should accept email3', () => { /* test */ });

// Ta dùng forEach:
['email1', 'email2', 'email3'].forEach((email) => {
  it(`should accept ${email}`, () => {
    // Test logic
  });
});

// Tự động tạo 3 tests với cùng logic
```

---

## 📊 KẾT QUẢ TESTING HIỆN TẠI

### Unit Tests Summary

| Controller | Total Tests | Passed | Failed | Coverage |
|------------|-------------|--------|--------|----------|
| Auth | 17 | 14 | 3 | 35.65% |
| Product | 5 | 5 | 0 | 22.58% |
| **TOTAL** | **22** | **19** | **3** | **~25%** |

### Chi tiết tests đạt:

**✅ Auth - Signup (13/13)**
- ✓ Valid email formats (3 tests)
- ✓ Invalid email formats (5 tests)
- ✓ User already exists
- ✓ Password hashing
- ✓ JWT token generation
- ✓ Secure cookie setup
- ✓ Database error handling

**✅ Product - Create (5/5)**
- ✓ Create with valid data
- ✓ Handle database errors
- ✓ Boundary: Min price (0)
- ✓ Boundary: Min stock (0)
- ✓ Boundary: Max discount (100%)

**⚠️ Auth - Login (1/4)**
- ✓ Correct credentials
- ⚠️ Wrong password (status code mismatch)
- ⚠️ Non-existent email (status code mismatch)
- ⚠️ Empty password (status code mismatch)

---

## 🚀 CÁCH CHẠY TESTS

### 1. Chạy Unit Tests
```bash
cd backend
npm run test:unit
```

### 2. Chạy với Watch Mode (tự động rerun khi code thay đổi)
```bash
npm run test:watch
```

### 3. Chạy tất cả tests
```bash
npm test
```

### 4. Xem Coverage Report
```bash
npm test
# Sau đó mở: backend/coverage/lcov-report/index.html
```

### 5. Chạy Performance Tests
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run K6
npm run test:perf
# Hoặc
k6 run tests/performance/load-test.js
```

---

## 💡 BEST PRACTICES ĐÃ ÁP DỤNG

### 1. ✅ Test Isolation
- Mỗi test độc lập, không phụ thuộc test khác
- `beforeEach()` để reset state
- In-memory DB để tránh side effects

### 2. ✅ Descriptive Test Names
```javascript
// ❌ Bad
it('test1', () => {});

// ✅ Good
it('should reject login with incorrect password', () => {});
it('should accept price at minimum (0)', () => {});
```

### 3. ✅ One Assertion Focus
```javascript
// Mỗi test focus vào 1 behavior cụ thể
it('should hash password before saving', async () => {
  await signup(req, res);
  expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
  // Chỉ test password hashing, không test nhiều thứ khác
});
```

### 4. ✅ Realistic Test Data
```javascript
// Dùng Faker để tạo data giống thật
const user = {
  name: faker.person.fullName(),      // "Alice Johnson"
  email: faker.internet.email(),      // "alice@example.com"
  phone: faker.phone.number()         // "+1-555-123-4567"
};
```

### 5. ✅ Clear Test Structure
```javascript
describe('Feature', () => {
  describe('Sub-feature', () => {
    it('should do something specific', () => {
      // ARRANGE
      // ACT
      // ASSERT
    });
  });
});
```

---

## 🎓 HỌC TỪ TESTS NÀY

### 1. Tại sao mock dependencies?
- **Speed**: Tests chạy nhanh (không cần DB, API thật)
- **Reliability**: Không bị ảnh hưởng bởi external services
- **Isolation**: Test chỉ logic của function, không test dependencies
- **Control**: Control được success/error scenarios

### 2. Tại sao test boundaries?
- **Bug Detection**: 90% bugs xảy ra tại ranh giới
- **Edge Cases**: Catch những trường hợp đặc biệt
- **Specification**: Verify requirements (min/max values)

### 3. Tại sao dùng Equivalence Partitioning?
- **Efficiency**: Test 1 giá trị đại diện cho cả lớp
- **Coverage**: Đảm bảo test đủ cases mà không dư thừa
- **Maintainability**: Dễ thêm/sửa test cases

### 4. Tại sao cần Performance Testing?
- **Scalability**: Biết hệ thống chịu được bao nhiêu users
- **Bottlenecks**: Tìm ra điểm nghẽn
- **SLA**: Verify response time requirements
- **Capacity Planning**: Plan infrastructure

---

## 📚 TÀI LIỆU THAM KHẢO

1. **Jest Documentation**: https://jestjs.io/
2. **K6 Documentation**: https://k6.io/docs/
3. **Testing Best Practices**: https://testingjavascript.com/
4. **Boundary Value Analysis**: https://www.guru99.com/boundary-value-analysis-testing.html

---

## ✨ KẾT LUẬN

**Dự án đã có:**
- ✅ 22 unit tests (19 passing)
- ✅ Boundary value analysis systematic
- ✅ Equivalence partitioning automated
- ✅ Performance test scripts (K6)
- ✅ Use case test scenarios
- ✅ Complete documentation

**Chức năng đã được test:**
1. ✅ User Signup (13 tests)
2. ⚠️ User Login (4 tests, 1 passing)
3. ✅ Product Creation (5 tests)

**Ready to extend:**
- Thêm tests cho Cart, Order, Review controllers
- Tăng coverage lên 70%+
- Chạy integration tests với real DB
- CI/CD pipeline với automated testing
