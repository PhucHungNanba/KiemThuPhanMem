# 🌐 HƯỚNG DẪN KẾT NỐI MONGODB ATLAS CHO TESTS

## 📋 Có 2 cách chạy tests:

### 1. **In-Memory MongoDB** (Mặc định) ⚡
- Tests chạy nhanh (~12s)
- Không cần MongoDB server
- Tự động cleanup
- Không ảnh hưởng dữ liệu thật

### 2. **MongoDB Atlas** (Dữ liệu thật) 🌐
- Test với database thật
- Gần môi trường production
- Có thể test với data seed thật
- Chậm hơn (~30-60s)

---

## 🚀 CÁCH 1: Setup MongoDB Atlas

### Bước 1: Tạo MongoDB Atlas Account
1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Đăng ký/Đăng nhập free account
3. Tạo cluster mới (chọn Free Tier - M0)
4. Chọn region gần bạn nhất (Singapore cho VN)

### Bước 2: Lấy Connection String
1. Vào cluster → Click "Connect"
2. Chọn "Connect your application"
3. Copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Bước 3: Tạo Database & User
1. Database Access → Add New Database User
   - Username: `test_user`
   - Password: `test_password_123`
   - Role: `Read and write to any database`

2. Network Access → Add IP Address
   - Chọn "Allow access from anywhere" (0.0.0.0/0)
   - (Hoặc add IP cụ thể của bạn)

### Bước 4: Config trong Project

**File: `.env.test`**
```env
# Bật sử dụng Atlas
USE_ATLAS=true

# Thay thế với connection string của bạn
MONGODB_ATLAS_TEST_URI=mongodb+srv://test_user:test_password_123@cluster0.xxxxx.mongodb.net/ecommerce_test?retryWrites=true&w=majority
```

**Thay thế:**
- `test_user` → username bạn tạo
- `test_password_123` → password bạn tạo
- `cluster0.xxxxx` → cluster address của bạn
- `ecommerce_test` → tên database cho testing

### Bước 5: Update Setup File

**Cách A: Dùng file setup mới**
```bash
# File jest.config.js
setupFilesAfterEnv: ['<rootDir>/tests/setup-atlas.js']
```

**Cách B: Update file setup hiện tại**
Copy nội dung từ `tests/setup-atlas.js` vào `tests/setup.js`

---

## 🔧 CHẠY TESTS VỚI ATLAS

### Option 1: Set trong .env.test
```env
USE_ATLAS=true
MONGODB_ATLAS_TEST_URI=mongodb+srv://...
```
```bash
npm run test:unit
```

### Option 2: Set tạm thời (không lưu file)
```bash
# Windows PowerShell
$env:USE_ATLAS="true"; $env:MONGODB_ATLAS_TEST_URI="mongodb+srv://..."; npm run test:unit

# Linux/Mac
USE_ATLAS=true MONGODB_ATLAS_TEST_URI="mongodb+srv://..." npm run test:unit
```

---

## 📊 SO SÁNH 2 PHƯƠNG PHÁP

| Tiêu chí | In-Memory | MongoDB Atlas |
|----------|-----------|---------------|
| **Tốc độ** | ⚡ Rất nhanh (12s) | 🐢 Chậm hơn (30-60s) |
| **Setup** | ✅ Không cần | ⚠️ Cần account & config |
| **Isolation** | ✅ Hoàn toàn độc lập | ⚠️ Có thể conflict |
| **Data** | ❌ Fake data | ✅ Real data |
| **Cleanup** | ✅ Tự động | ⚠️ Phải code cleanup |
| **Cost** | ✅ Free | ✅ Free (M0 tier) |
| **Phù hợp** | Unit tests | Integration tests |
| **CI/CD** | ✅ Easy | ⚠️ Need secrets |

---

## 💡 KHUYẾN NGHỊ

### Dùng In-Memory khi:
- ✅ Viết unit tests
- ✅ Test logic riêng lẻ
- ✅ Cần tests chạy nhanh
- ✅ CI/CD pipeline
- ✅ Local development

### Dùng MongoDB Atlas khi:
- ✅ Integration tests
- ✅ Test với data thật
- ✅ Test performance với data lớn
- ✅ Test migration scripts
- ✅ Manual testing/debugging

---

## 🎯 BEST PRACTICE: Kết hợp cả 2

```javascript
// jest.config.js
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/tests/unit/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // In-memory
    },
    {
      displayName: 'integration',
      testMatch: ['**/tests/integration/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-atlas.js'], // Atlas
    },
  ],
};
```

**Chạy:**
```bash
# Unit tests (fast, in-memory)
npm run test:unit

# Integration tests (slow, real DB)
npm run test:integration
```

---

## 🔒 BẢO MẬT

### ❌ KHÔNG BAO GIỜ:
```env
# ĐỪNG commit vào Git
MONGODB_ATLAS_TEST_URI=mongodb+srv://user:password@...
```

### ✅ NÊN:
```bash
# Add vào .gitignore
echo ".env.test" >> .gitignore
```

### ✅ CHO CI/CD:
```yaml
# GitHub Actions
env:
  MONGODB_ATLAS_TEST_URI: ${{ secrets.MONGODB_ATLAS_TEST_URI }}
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "MongoServerError: bad auth"
```bash
# Check username/password
# Check IP whitelist trong Atlas
```

### Lỗi: "Connection timeout"
```bash
# Check internet connection
# Check firewall
# Check Network Access trong Atlas (allow 0.0.0.0/0)
```

### Tests chạy chậm
```bash
# Tăng timeout
jest.setTimeout(60000); # 60 seconds
```

### Data không cleanup
```javascript
// Trong afterEach
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

---

## 📝 VÍ DỤ HOÀN CHỈNH

### File: `.env.test`
```env
USE_ATLAS=true
MONGODB_ATLAS_TEST_URI=mongodb+srv://test_user:SecurePass123@cluster0.abc12.mongodb.net/ecommerce_test?retryWrites=true&w=majority

# Các config khác giữ nguyên
JWT_SECRET=test_jwt_secret
BCRYPT_SALT_ROUNDS=1
```

### Chạy tests:
```bash
cd backend

# Test với Atlas
npm run test:unit

# Output:
# 🌐 Connecting to MongoDB Atlas (Real Database)...
# ✅ Connected to MongoDB Atlas
# 
# PASS tests/unit/controllers/Auth.test.js
#   ✓ should create user (250ms)
#   ✓ should validate email (180ms)
# 
# Test Suites: 2 passed
# Tests: 22 passed
# Time: 45.231s
```

---

## ✨ KẾT LUẬN

**Có thể dùng MongoDB Atlas!** 

**Để bắt đầu:**
1. ✅ Tạo MongoDB Atlas account (free)
2. ✅ Lấy connection string
3. ✅ Set trong `.env.test`
4. ✅ Chạy `npm run test:unit`

**File đã tạo:**
- ✅ `tests/setup-atlas.js` - Setup file hỗ trợ Atlas
- ✅ `.env.test` đã update với config Atlas

**Chạy thử ngay:**
```bash
# 1. Set connection string trong .env.test
# 2. Chạy
npm run test:unit
```
