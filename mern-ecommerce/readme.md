## MERN Ecommerce: A Seamless Shopping Experience Powered by the MERN Stack, Redux Toolkit, and Material UI

### Also try -> [https://mernchat.in](https://mernchat.in)
### ```Note✨: I have another amazing project on``` [end-to-end-encrypted-chat-application](https://github.com/RishiBakshii/mern-chat) ```using Next.js, Prisma, Postgresql, Express, Socket.io.```

**MERN Ecommerce** is a full-stack application designed to transform your online shopping experience. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it leverages Redux Toolkit for efficient state management and Material UI for a sleek, user-friendly interface. This project offers a robust platform for both users and admins, packed with essential features for a seamless experience.

![ecommerce-homepage](https://github.com/RishiBakshii/mern-ecommerce/blob/main/frontend/src/assets/images/front.png?raw=true)
<!-- ![ecommerce-banner](https://github.com/RishiBakshii/mern-ecommerce/blob/main/frontend/src/assets/images/banner4.jpg?raw=true) -->
![ecommerce-banner](https://github.com/RishiBakshii/mern-ecommerce/blob/main/frontend/src/assets/images/banner3.jpg?raw=true)


# **Features**

### **User:**
- **Product Reviews:**
  - Write, edit, and delete reviews.
  - Instant updates on ratings and star percentages.
  
- **Wishlist:**
  - Add, remove, and annotate products with personalized notes.
  
- **Order Management:**
  - Create new orders and view order history.
  
- **Profile Management:**
  - Manage email, username, and multiple addresses.
  
- **Shopping Cart:**
  - Add products, adjust quantities, and view subtotals.

### **Admin:**
- **Product Management:**
  - Add, edit, delete, and soft-delete products.
  - Manage product attributes like name and stock.
  
- **Order Management:**
  - View and update order details and status.

### **Security & User Experience:**
- **Secure Authentication:**
  - Login, signup, OTP verification, password reset, and logout.

- **Intuitive Interface:**
  - Powered by Material UI for a visually appealing and user-friendly experience.

### **Scalability:**
- **Built for Growth:**
  - Scalable architecture to handle increasing user demands.


# **Project Setup**

### Prerequisites
- Node.js ( version v21.1.0 or later )
- MongoDB installed and running locally

### Clone the project

```bash
  git clone https://github.com/RishiBakshii/mern-ecommerce.git
```

### Navigate to the project directory

```bash
  cd mern-ecommerce
```

### Environment Variables
**Backend**
- Create a `.env` file in the `backend` directory.
- Add the following variables with appropriate values
```bash
# ===== DATABASE CONFIG =====
MONGO_URI=mongodb://localhost:27017/ecommerce_db

# ===== FRONTEND CONFIG =====
ORIGIN=http://localhost:3000

# ===== EMAIL CONFIG (email và passkey để gửi mail otp) =====
EMAIL=
PASSWORD=

# ===== TOKEN & COOKIE =====
LOGIN_TOKEN_EXPIRATION=30d
OTP_EXPIRATION_TIME=120000
PASSWORD_RESET_TOKEN_EXPIRATION=2m
COOKIE_EXPIRATION_DAYS=30

# ===== JWT SECURITY =====
SECRET_KEY=my-super-secret-key

# ===== ENVIRONMENT =====
PRODUCTION=false
```

**Frontend**
- Create a `.env` file in the `frontend` directory
- Add the following variable:
```bash
# Backend URL (adjust if needed)
REACT_APP_BASE_URL="http://localhost:8000" 
```

**Important**
- Replace all placeholders (e.g., your_database_name, your_email) with your actual values.
- Exclude the `.env` file from version control to protect sensitive information.

### Run with docker-compose

  To run this with docker-compose please run the following commands.
  ***Please make sure that docker and docker-compose is installed in your system.***
  
  ```
   > docker-compose up -d --build
  ```
  - Go to your browser and type `http://localhost:3000` and the whole project is ready to use.
  - ***if you initialy encoutered connection refused error please wait for few seconds and relod the page.**

### Data seeding
- **Get started quickly with pre-populated data**: Populate your database with sample users, products, reviews, and carts, enabling you to test functionalities without manual data entry.

**Steps**:
- Open a new terminal window.
- Navigate to the `backend` directory: `cd backend`
- Run the seeding script: `npm run seed` ( This script executes the `seed.js` file within the `seed` subdirectory equivalent to running `node seed/seed.js` )
### Running Development Servers

**Important:**

- **Separate terminals**: Run the commands in separate terminal windows or use `split terminal` to avoid conflicts.
- **Nodemon required**: Ensure you have `nodemon` installed globally to run the backend development servers using `npm run dev`. You can install it globally using `npm install -g nodemon`.

#### Start the backend server
- Navigate to the `backend` directory: `cd backend`
- Start the server: `npm run dev` (or npm start)
- You should see a message indicating the server is running, usually on port 8000.
     
#### Start the frontend server:
- Navigate to the `frontend` directory: `cd frontend`
- Start the server: `npm start`
- You should see a message indicating the server is running, usually on port 3000.

### Login with demo account (Optional)
- After successfully seeding the database, you can now explore the application's functionalities using pre-populated sample data.
- here are the `login credentials`
```bash
  email: demo@gmail.com
  pass: helloWorld@123
```

- **Please Note**: While the demo account provides a convenient way to explore many features, it has some limitations:
    - **Password Reset and OTP Verification**: Due to security reasons, the demo account uses a non-real email address. Therefore, password reset and OTP verification functionalities are not available for this account.

    **What this means**:
    - You cannot request a password reset or receive verification codes on the demo email address.
    - To test password reset and OTP verification flows, you need to create a genuine account with a valid email address.

    **What to do?**
    - If you're primarily interested in exploring other functionalities like wishlist, cart, and order history, the demo account is sufficient.
    - To test password reset and OTP verification, create a personal account with a valid email address.
### Accessing the Application
Once both servers are running, you can access them at the following URL's:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

# **Testing**

### ✨ Comprehensive Testing Suite
This project includes a complete testing infrastructure with:
- **Unit Tests** with mock dependencies (Jest)
- **Black-Box Testing** with Equivalence Partitioning & Boundary Analysis
- **Performance Tests** with K6 (100-300 concurrent users)
- **Use Case Tests** for complete business flows
- **Separate test environment** configuration

### Quick Start Testing

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Run unit tests
npm run test:unit

# Run all tests
npm test

# Run with watch mode
npm run test:watch

# View coverage report
# Opens: backend/coverage/index.html
```

### Performance Testing with K6

**Install K6:**
```powershell
# Windows (Chocolatey)
choco install k6

# Windows (MSI)
# Download from: https://dl.k6.io/msi/k6-latest-amd64.msi

# macOS
brew install k6

# Linux
sudo apt-get install k6
```

**Run Performance Tests:**
```bash
# Start backend server first
cd backend
npm start

# In another terminal, run K6 tests
npm run test:perf

# Or directly
k6 run tests/performance/load-test.js
```

### Interactive Test Runner

```powershell
# Windows PowerShell
.\run-tests.ps1              # Choose test type interactively
.\run-performance-tests.ps1  # Run K6 performance tests
```

### Testing Documentation
- 📖 **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Quick start guide
- 📖 **[TESTING_SUMMARY.md](TESTING_SUMMARY.md)** - Complete testing overview
- 📖 **[tests/README.md](backend/tests/README.md)** - Detailed documentation

### Test Coverage
Current coverage:
- Auth Controller: 35.65%
- Product Controller: 22.58%
- 22 unit tests (19 passing)

**Testing Techniques Applied:**
- ✅ Unit Testing with Jest mocks
- ✅ Equivalence Partitioning for input validation
- ✅ Boundary Value Analysis for edge cases
- ✅ Performance Testing with K6 (100-300 concurrent users)
- ✅ Use Case Testing for business flows

## **Bonus**
Don't forget to star the repository and share your feedback!✨

## Authors
- [@RishiBakshii](https://github.com/RishiBakshii)
