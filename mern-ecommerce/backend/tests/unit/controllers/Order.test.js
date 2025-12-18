const request = require('supertest');
const express = require('express');
const Order = require('../../../models/Order');
const Product = require('../../../models/Product');
const User = require('../../../models/User');
const Brand = require('../../../models/Brand');
const { create, getByUserId, updateById } = require('../../../controllers/Order');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.post('/orders', create);
app.get('/orders/user/:id', getByUserId);
app.put('/orders/:id', updateById);

describe('Order Controller - Integration Tests with Real MongoDB Atlas', () => {
  let testUser;
  let testProduct;
  let testBrand;
  let testOrder;

  beforeAll(async () => {
    // Create test brand
    testBrand = await Brand.create({
      name: 'Test Order Brand',
      value: 'test-order-brand'
    });

    // Create test user
    testUser = await User.create({
      name: 'Test Order User',
      email: `testorder${Date.now()}@example.com`,
      password: 'hashedpassword123'
    });

    // Create test product
    testProduct = await Product.create({
      title: 'Test Order Product',
      description: 'Product for order testing',
      price: 200,
      stockQuantity: 100,
      brand: testBrand._id,
      category: testBrand._id, // Use brand as category temporarily
      thumbnail: 'https://example.com/thumbnail.jpg',
      images: ['https://example.com/image1.jpg'],
      discountPercentage: 15
    });
  });

  afterEach(async () => {
    // Clean up test order
    if (testOrder && testOrder._id) {
      await Order.findByIdAndDelete(testOrder._id);
      testOrder = null;
    }
  });

  afterAll(async () => {
    // Clean up all test data
    await Order.deleteMany({ user: testUser._id });
    await Product.findByIdAndDelete(testProduct._id);
    await User.findByIdAndDelete(testUser._id);
    await Brand.findByIdAndDelete(testBrand._id);
  });

  describe('create Order - Real Database Tests', () => {
    it('should create an order successfully', async () => {
      const orderData = {
        user: testUser._id,
        item: [
          {
            product: testProduct._id,
            quantity: 2,
            price: 200
          }
        ],
        total: 340,
        paymentMode: 'CARD',
        address: [
          {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zip: '12345',
            country: 'Test Country'
          }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.user.toString()).toBe(testUser._id.toString());
      expect(response.body.total).toBe(340);
      expect(response.body.status).toBe('Pending'); // Default status

      testOrder = response.body;
    });

    it('should create order with multiple items', async () => {
      const orderData = {
        user: testUser._id,
        item: [
          { product: testProduct._id, quantity: 1, price: 200 },
          { product: testProduct._id, quantity: 2, price: 200 }
        ],
        total: 510,
        paymentMode: 'COD',
        address: [
          {
            street: '456 Order Ave',
            city: 'Order City',
            state: 'Order State',
            zip: '54321',
            country: 'Order Country'
          }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.item.length).toBe(2);
      testOrder = response.body;
    });

    it('should handle errors when creating order with invalid data', async () => {
      const invalidOrderData = {
        user: testUser._id
        // Missing required fields
      };

      await request(app)
        .post('/orders')
        .send(invalidOrderData)
        .expect(500);
    });

    it('should create order with minimum total amount', async () => {
      const orderData = {
        user: testUser._id,
        item: [{ product: testProduct._id, quantity: 1, price: 1 }],
        total: 1,
        paymentMode: 'UPI',
        address: [
          {
            street: 'Min St',
            city: 'Min City',
            state: 'Min State',
            zip: '11111',
            country: 'Min Country'
          }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.total).toBe(1);
      testOrder = response.body;
    });
  });

  describe('getByUserId - Real Database Tests', () => {
    beforeEach(async () => {
      // Create multiple orders for user
      await Order.create([
        {
          user: testUser._id,
          item: [{ product: testProduct._id, quantity: 1, price: 170 }],
          total: 170,
          paymentMode: 'CARD',
          address: [{ street: 'St 1', city: 'City 1', state: 'State 1', zip: '11111', country: 'Country 1' }]
        },
        {
          user: testUser._id,
          item: [{ product: testProduct._id, quantity: 2, price: 170 }],
          total: 340,
          paymentMode: 'COD',
          address: [{ street: 'St 2', city: 'City 2', state: 'State 2', zip: '22222', country: 'Country 2' }]
        }
      ]);
    });

    afterEach(async () => {
      await Order.deleteMany({ user: testUser._id });
    });

    it('should get all orders for user', async () => {
      const response = await request(app)
        .get(`/orders/user/${testUser._id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      response.body.forEach(order => {
        expect(order.user.toString()).toBe(testUser._id.toString());
      });
    });

    it('should return empty array for user with no orders', async () => {
      const newUser = await User.create({
        name: 'No Orders User',
        email: `noorders${Date.now()}@example.com`,
        password: 'hashedpassword123'
      });

      const response = await request(app)
        .get(`/orders/user/${newUser._id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      await User.findByIdAndDelete(newUser._id);
    });

    it('should populate item information in orders', async () => {
      const response = await request(app)
        .get(`/orders/user/${testUser._id}`)
        .expect(200);

      if (response.body.length > 0) {
        expect(response.body[0].item[0]).toHaveProperty('product');
      }
    });
  });

  describe('updateById Order - Real Database Tests', () => {
    beforeEach(async () => {
      testOrder = await Order.create({
        user: testUser._id,
        item: [{ product: testProduct._id, quantity: 1, price: 170 }],
        total: 170,
        paymentMode: 'CARD',
        status: 'Pending',
        address: [
          {
            street: 'Update St',
            city: 'Update City',
            state: 'Update State',
            zip: '88888',
            country: 'Update Country'
          }
        ]
      });
    });

    it('should update order status successfully', async () => {
      const updateData = { status: 'Dispatched' };

      const response = await request(app)
        .put(`/orders/${testOrder._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('Dispatched');
      expect(response.body._id.toString()).toBe(testOrder._id.toString());
    });

    it('should update order status to Out for delivery', async () => {
      const response = await request(app)
        .put(`/orders/${testOrder._id}`)
        .send({ status: 'Out for delivery' })
        .expect(200);

      expect(response.body.status).toBe('Out for delivery');
    });

    it('should update order status to Cancelled', async () => {
      const response = await request(app)
        .put(`/orders/${testOrder._id}`)
        .send({ status: 'Cancelled' })
        .expect(200);

      expect(response.body.status).toBe('Cancelled');
    });

    it('should handle updating non-existent order', async () => {
      await request(app)
        .put('/orders/507f1f77bcf86cd799439011')
        .send({ status: 'processing' })
        .expect(200); // Returns null with 200
    });
  });

  describe('Order Status Workflow Tests', () => {
    beforeEach(async () => {
      testOrder = await Order.create({
        user: testUser._id,
        item: [{ product: testProduct._id, quantity: 1, price: 170 }],
        total: 170,
        paymentMode: 'CARD',
        status: 'Pending',
        address: [
          {
            street: 'Workflow St',
            city: 'Workflow City',
            state: 'Workflow State',
            zip: '77777',
            country: 'Workflow Country'
          }
        ]
      });
    });

    it('should follow complete order lifecycle: Pending -> Dispatched -> Out for delivery', async () => {
      // Step 1: Dispatched
      let response = await request(app)
        .put(`/orders/${testOrder._id}`)
        .send({ status: 'Dispatched' })
        .expect(200);
      expect(response.body.status).toBe('Dispatched');

      // Step 2: Out for delivery
      response = await request(app)
        .put(`/orders/${testOrder._id}`)
        .send({ status: 'Out for delivery' })
        .expect(200);
      expect(response.body.status).toBe('Out for delivery');
    });

    it('should allow order cancellation from Pending status', async () => {
      const response = await request(app)
        .put(`/orders/${testOrder._id}`)
        .send({ status: 'Cancelled' })
        .expect(200);

      expect(response.body.status).toBe('Cancelled');
    });
  });

  describe('Order Payment Method Tests', () => {
    it('should create order with CARD payment', async () => {
      const orderData = {
        user: testUser._id,
        item: [{ product: testProduct._id, quantity: 1, price: 170 }],
        total: 170,
        paymentMode: 'CARD',
        address: [
          {
            street: 'Card St',
            city: 'Card City',
            state: 'Card State',
            zip: '66666',
            country: 'Card Country'
          }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.paymentMode).toBe('CARD');
      testOrder = response.body;
    });

    it('should create order with COD payment', async () => {
      const orderData = {
        user: testUser._id,
        item: [{ product: testProduct._id, quantity: 1, price: 170 }],
        total: 170,
        paymentMode: 'COD',
        address: [
          {
            street: 'Cash St',
            city: 'Cash City',
            state: 'Cash State',
            zip: '55555',
            country: 'Cash Country'
          }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.paymentMode).toBe('COD');
      testOrder = response.body;
    });

    it('should create order with UPI payment', async () => {
      const orderData = {
        user: testUser._id,
        item: [{ product: testProduct._id, quantity: 1, price: 170 }],
        total: 170,
        paymentMode: 'UPI',
        address: [
          {
            street: 'UPI St',
            city: 'UPI City',
            state: 'UPI State',
            zip: '44444',
            country: 'UPI Country'
          }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.paymentMode).toBe('UPI');
      testOrder = response.body;
    });
  });
});
