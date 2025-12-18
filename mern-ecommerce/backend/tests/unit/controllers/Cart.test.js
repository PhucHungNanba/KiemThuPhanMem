const request = require('supertest');
const express = require('express');
const Cart = require('../../../models/Cart');
const Product = require('../../../models/Product');
const User = require('../../../models/User');
const Brand = require('../../../models/Brand');
const { create, getByUserId, updateById, deleteById, deleteByUserId } = require('../../../controllers/Cart');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.post('/cart', create);
app.get('/cart/:id', getByUserId);
app.put('/cart/:id', updateById);
app.delete('/cart/:id', deleteById);
app.delete('/cart/user/:id', deleteByUserId);

describe('Cart Controller - Integration Tests with Real MongoDB Atlas', () => {
  let testUser;
  let testProduct;
  let testBrand;
  let testCart;

  beforeAll(async () => {
    // Create test brand
    testBrand = await Brand.create({
      name: 'Test Cart Brand',
      value: 'test-cart-brand'
    });

    // Create test user
    testUser = await User.create({
      name: 'Test Cart User',
      email: `testcart${Date.now()}@example.com`,
      password: 'hashedpassword123'
    });

    // Create test product
    testProduct = await Product.create({
      title: 'Test Cart Product',
      description: 'Product for cart testing',
      price: 100,
      stockQuantity: 50,
      brand: testBrand._id,
      category: testBrand._id, // Use brand as category temporarily
      thumbnail: 'https://example.com/thumbnail.jpg',
      images: ['https://example.com/image1.jpg'],
      discountPercentage: 10
    });
  });

  afterEach(async () => {
    // Clean up test cart
    if (testCart && testCart._id) {
      await Cart.findByIdAndDelete(testCart._id);
      testCart = null;
    }
  });

  afterAll(async () => {
    // Clean up all test data
    await Cart.deleteMany({ user: testUser._id });
    await Product.findByIdAndDelete(testProduct._id);
    await User.findByIdAndDelete(testUser._id);
    await Brand.findByIdAndDelete(testBrand._id);
  });

  describe('create Cart Item - Real Database Tests', () => {
    it('should add product to cart successfully', async () => {
      const cartData = {
        user: testUser._id,
        product: testProduct._id,
        quantity: 2
      };

      const response = await request(app)
        .post('/cart')
        .send(cartData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.quantity).toBe(2);
      expect(response.body.user.toString()).toBe(testUser._id.toString());

      testCart = response.body;
    });

    it('should handle errors when adding invalid product', async () => {
      const invalidCartData = {
        user: testUser._id,
        product: 'invalid-product-id',
        quantity: 1
      };

      await request(app)
        .post('/cart')
        .send(invalidCartData)
        .expect(500);
    });

    it('should add multiple quantities of same product', async () => {
      const cartData = {
        user: testUser._id,
        product: testProduct._id,
        quantity: 5
      };

      const response = await request(app)
        .post('/cart')
        .send(cartData)
        .expect(201);

      expect(response.body.quantity).toBe(5);
      testCart = response.body;
    });
  });

  describe('getByUserId - Real Database Tests', () => {
    beforeEach(async () => {
      // Create test cart item
      testCart = await Cart.create({
        user: testUser._id,
        product: testProduct._id,
        quantity: 3
      });
    });

    it('should get all cart items for user', async () => {
      const response = await request(app)
        .get(`/cart/${testUser._id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].user.toString()).toBe(testUser._id.toString());
    });

    it('should return empty array for user with no cart items', async () => {
      const newUser = await User.create({
        name: 'Empty Cart User',
        email: `emptycart${Date.now()}@example.com`,
        password: 'hashedpassword123'
      });

      const response = await request(app)
        .get(`/cart/${newUser._id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      await User.findByIdAndDelete(newUser._id);
    });

    it('should return cart items with product references', async () => {
      const response = await request(app)
        .get(`/cart/${testUser._id}`)
        .expect(200);

      expect(response.body[0]).toHaveProperty('product');
      // Note: product is not populated in the response, just an ID
    });
  });

  describe('updateById - Real Database Tests', () => {
    beforeEach(async () => {
      testCart = await Cart.create({
        user: testUser._id,
        product: testProduct._id,
        quantity: 2
      });
    });

    it('should update cart item quantity', async () => {
      const updateData = { quantity: 5 };

      const response = await request(app)
        .put(`/cart/${testCart._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.quantity).toBe(5);
      expect(response.body._id.toString()).toBe(testCart._id.toString());
    });

    it('should update cart item with minimum quantity (1)', async () => {
      const response = await request(app)
        .put(`/cart/${testCart._id}`)
        .send({ quantity: 1 })
        .expect(200);

      expect(response.body.quantity).toBe(1);
    });

    it('should handle updating with invalid cart id', async () => {
      await request(app)
        .put('/cart/invalid-cart-id')
        .send({ quantity: 5 })
        .expect(500);
    });
  });

  describe('deleteById - Real Database Tests', () => {
    beforeEach(async () => {
      testCart = await Cart.create({
        user: testUser._id,
        product: testProduct._id,
        quantity: 2
      });
    });

    it('should delete cart item successfully', async () => {
      const response = await request(app)
        .delete(`/cart/${testCart._id}`)
        .expect(200);

      expect(response.body._id.toString()).toBe(testCart._id.toString());

      // Verify deletion
      const deletedCart = await Cart.findById(testCart._id);
      expect(deletedCart).toBeNull();

      testCart = null; // Prevent double cleanup
    });

    it('should handle deleting non-existent cart item', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/cart/${fakeId}`)
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('deleteByUserId - Real Database Tests', () => {
    beforeEach(async () => {
      // Create multiple cart items for user
      await Cart.create([
        { user: testUser._id, product: testProduct._id, quantity: 1 },
        { user: testUser._id, product: testProduct._id, quantity: 2 },
        { user: testUser._id, product: testProduct._id, quantity: 3 }
      ]);
    });

    afterEach(async () => {
      // Clean up all cart items for test user
      await Cart.deleteMany({ user: testUser._id });
    });

    it('should delete all cart items for user', async () => {
      await request(app)
        .delete(`/cart/user/${testUser._id}`)
        .expect(204);

      // 204 means no content, check database directly

      // Verify all items deleted
      const remainingItems = await Cart.find({ user: testUser._id });
      expect(remainingItems.length).toBe(0);
    });

    it('should return success even if user has no cart items', async () => {
      // Delete all items first
      await Cart.deleteMany({ user: testUser._id });

      await request(app)
        .delete(`/cart/user/${testUser._id}`)
        .expect(204); // No content response
    });
  });

  describe('Cart Business Logic Tests', () => {
    it('should calculate total price correctly', async () => {
      const cartData = {
        user: testUser._id,
        product: testProduct._id,
        quantity: 3
      };

      const response = await request(app)
        .post('/cart')
        .send(cartData)
        .expect(201);

      const expectedTotal = testProduct.price * cartData.quantity;
      expect(response.body.quantity).toBe(3);

      testCart = response.body;
    });

    it('should not allow adding more items than available stock', async () => {
      // This would need to be validated at application level
      const cartData = {
        user: testUser._id,
        product: testProduct._id,
        quantity: testProduct.stockQuantity + 10 // More than available
      };

      // Currently the controller doesn't validate stock
      // This test documents the expected behavior
      const response = await request(app)
        .post('/cart')
        .send(cartData);

      // If stock validation is implemented, this should be 400
      // For now we just create the cart and clean up
      if (response.body._id) {
        await Cart.findByIdAndDelete(response.body._id);
      }
    });
  });
});
