const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const { signup, login, logout, checkAuth } = require('../../../controllers/Auth');
const { generateUser, equivalenceClasses } = require('../../fixtures/testData');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());

// Setup routes
app.post('/auth/signup', signup);
app.post('/auth/login', login);

describe('Auth Controller - Integration Tests with Real MongoDB Atlas', () => {
  let testUser;

  beforeAll(async () => {
    // Clean up any existing test users
    await User.deleteMany({ email: /test.*@/ });
  });

  afterEach(async () => {
    // Clean up test data after each test
    if (testUser && testUser._id) {
      await User.findByIdAndDelete(testUser._id);
      testUser = null;
    }
  });

  afterAll(async () => {
    // Final cleanup
    await User.deleteMany({ email: /test.*@/ });
  });

  describe('signup - Real Database Tests', () => {
    it('should create a new user with valid data', async () => {
      const userData = await generateUser();
      
      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe(userData.email);
      expect(response.body.name).toBe(userData.name);
      expect(response.body).not.toHaveProperty('password');

      // Verify user exists in database
      const dbUser = await User.findOne({ email: userData.email });
      expect(dbUser).toBeTruthy();
      expect(dbUser.email).toBe(userData.email);
      
      // Verify password is hashed
      const isPasswordHashed = await bcrypt.compare(userData.password, dbUser.password);
      expect(isPasswordHashed).toBe(true);

      testUser = dbUser;
    });

    it('should return 400 if user already exists', async () => {
      const userData = await generateUser();
      
      // Create user first time
      await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      // Try to create same user again
      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');

      // Cleanup
      const dbUser = await User.findOne({ email: userData.email });
      testUser = dbUser;
    });

    describe('Email Equivalence Partitioning - Valid Cases', () => {
      const validEmails = equivalenceClasses.email.valid.slice(0, 3); // Test first 3 valid emails

      validEmails.forEach((email) => {
        it(`should accept valid email format: ${email}`, async () => {
          const userData = await generateUser({ email });
          
          const response = await request(app)
            .post('/auth/signup')
            .send(userData)
            .expect(201);

          expect(response.body.email).toBe(email);

          // Cleanup
          const dbUser = await User.findOne({ email });
          if (dbUser) {
            await User.findByIdAndDelete(dbUser._id);
          }
        });
      });
    });

    describe('Password Validation', () => {
      it('should hash password before storing', async () => {
        const userData = await generateUser();
        const originalPassword = userData.password;
        
        await request(app)
          .post('/auth/signup')
          .send(userData)
          .expect(201);

        const dbUser = await User.findOne({ email: userData.email });
        expect(dbUser.password).not.toBe(originalPassword);
        expect(dbUser.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern

        testUser = dbUser;
      });

      it('should accept password with minimum length (8 chars)', async () => {
        const userData = await generateUser({ password: 'Pass1234' });
        
        const response = await request(app)
          .post('/auth/signup')
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty('_id');

        testUser = await User.findOne({ email: userData.email });
      });

      it('should accept password with special characters', async () => {
        const userData = await generateUser({ password: 'P@ssw0rd!#$' });
        
        const response = await request(app)
          .post('/auth/signup')
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty('_id');

        testUser = await User.findOne({ email: userData.email });
      });
    });

    describe('Required Fields Validation', () => {
      it('should return 500 if name is missing', async () => {
        const userData = await generateUser();
        delete userData.name;
        
        await request(app)
          .post('/auth/signup')
          .send(userData)
          .expect(500);
      });

      it('should return 500 if email is missing', async () => {
        const userData = await generateUser();
        delete userData.email;
        
        await request(app)
          .post('/auth/signup')
          .send(userData)
          .expect(500);
      });

      it('should return 500 if password is missing', async () => {
        const userData = await generateUser();
        delete userData.password;
        
        await request(app)
          .post('/auth/signup')
          .send(userData)
          .expect(500);
      });
    });
  });

  describe('login - Real Database Tests', () => {
    let existingUser;
    let userPassword;

    beforeEach(async () => {
      // Create a user for login tests
      userPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(userPassword, 10);
      
      existingUser = new User({
        name: 'Test Login User',
        email: `testlogin${Date.now()}@example.com`,
        password: hashedPassword
      });
      
      await existingUser.save();
    });

    afterEach(async () => {
      if (existingUser && existingUser._id) {
        await User.findByIdAndDelete(existingUser._id);
        existingUser = null;
      }
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: existingUser.email,
          password: userPassword
        })
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe(existingUser.email);
      expect(response.body).not.toHaveProperty('password');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 404 with invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userPassword
        })
        .expect(404);

      expect(response.body.message).toBe('Invalid Credentails');
    });

    it('should return 404 with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: existingUser.email,
          password: 'wrongpassword'
        })
        .expect(404);

      expect(response.body.message).toBe('Invalid Credentails');
    });

    it('should return 403 if account is disabled', async () => {
      // Disable the account
      await User.findByIdAndUpdate(existingUser._id, { isEnabled: false });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: existingUser.email,
          password: userPassword
        })
        .expect(403);

      expect(response.body.message).toContain('disabled');
    });

    it('should set JWT token in cookies on successful login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: existingUser.email,
          password: userPassword
        })
        .expect(200);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('token='))).toBe(true);
    });

    describe('Login Equivalence Partitioning', () => {
      it('should handle empty email', async () => {
        await request(app)
          .post('/auth/login')
          .send({
            email: '',
            password: userPassword
          })
          .expect(404);
      });

      it('should handle empty password', async () => {
        await request(app)
          .post('/auth/login')
          .send({
            email: existingUser.email,
            password: ''
          })
          .expect(404);
      });

      it('should handle malformed email', async () => {
        await request(app)
          .post('/auth/login')
          .send({
            email: 'not-an-email',
            password: userPassword
          })
          .expect(404);
      });
    });
  });

  describe('User Data Integrity', () => {
    it('should not expose sensitive data in response', async () => {
      const userData = await generateUser();
      
      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('name');

      testUser = await User.findOne({ email: userData.email });
    });

    it('should store user with correct default values', async () => {
      const userData = await generateUser();
      
      await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      const dbUser = await User.findOne({ email: userData.email });
      expect(dbUser.isEnabled).toBe(true); // Default enabled status
      expect(dbUser.isAdmin).toBe(false); // Default admin status

      testUser = dbUser;
    });

    it('should maintain data consistency across operations', async () => {
      const userData = await generateUser();
      
      // Signup
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      const signupUserId = signupResponse.body._id;

      // Login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body._id).toBe(signupUserId);
      expect(loginResponse.body.email).toBe(userData.email);

      testUser = await User.findById(signupUserId);

    });
  });
});
