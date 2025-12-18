const request = require('supertest');
const express = require('express');
const Product = require('../../../models/Product');
const Brand = require('../../../models/Brand');
const Category = require('../../../models/Category');
const { create, getAll, getById, updateById, deleteById } = require('../../../controllers/Product');
const { generateProduct, boundaryValues } = require('../../fixtures/testData');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.post('/products', create);
app.get('/products', getAll);
app.get('/products/:id', getById);
app.put('/products/:id', updateById);
app.delete('/products/:id', deleteById);

describe('Product Controller - Integration Tests with Real MongoDB Atlas', () => {
  let testProduct;
  let testBrand;
  let testCategory;

  beforeAll(async () => {
    // Create test brand and category
    testBrand = await Brand.create({
      name: 'Test Brand',
      value: 'test-brand'
    });

    testCategory = await Category.create({
      name: 'Test Category',
      value: 'test-category'
    });
  });

  afterEach(async () => {
    // Clean up test product
    if (testProduct && testProduct._id) {
      await Product.findByIdAndDelete(testProduct._id);
      testProduct = null;
    }
  });

  afterAll(async () => {
    // Clean up test data
    await Product.deleteMany({ title: /Test Product/ });
    if (testBrand) await Brand.findByIdAndDelete(testBrand._id);
    if (testCategory) await Category.findByIdAndDelete(testCategory._id);
  });

  describe('create Product - Real Database Tests', () => {
    it('should create a product successfully with valid data', async () => {
      const productData = generateProduct({
        brand: testBrand._id,
        category: testCategory._id
      });
      
      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(productData.title);
      expect(response.body.price).toBe(productData.price);

      testProduct = response.body;
    });

    it('should handle errors when creating product with invalid data', async () => {
      const invalidProduct = { title: 'Test Product' };
      
      await request(app)
        .post('/products')
        .send(invalidProduct)
        .expect(500);
    });

    it('should accept minimum valid price (0)', async () => {
      const productData = generateProduct({ 
        price: boundaryValues.price.min,
        brand: testBrand._id,
        category: testCategory._id
      });
      
      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body.price).toBe(0);
      await Product.findByIdAndDelete(response.body._id);
    });

    it('should accept minimum valid stock (0)', async () => {
      const productData = generateProduct({ 
        stockQuantity: boundaryValues.stock.min,
        brand: testBrand._id,
        category: testCategory._id
      });
      
      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body.stockQuantity).toBe(0);
      await Product.findByIdAndDelete(response.body._id);
    });

    it('should accept maximum valid discount (100%)', async () => {
      const productData = generateProduct({ 
        discountPercentage: boundaryValues.discount.max,
        brand: testBrand._id,
        category: testCategory._id
      });
      
      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body.discountPercentage).toBe(100);
      await Product.findByIdAndDelete(response.body._id);
    });
  });

  describe('getAll Products - Real Database Tests', () => {
    beforeEach(async () => {
      testProduct = await Product.create(generateProduct({
        brand: testBrand._id,
        category: testCategory._id,
        isDeleted: false
      }));
    });

    it('should get all products successfully', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.headers['x-total-count']).toBeDefined();
    });

    it('should filter products by brand', async () => {
      const response = await request(app)
        .get(`/products?brand=${testBrand._id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('getById Product - Real Database Tests', () => {
    beforeEach(async () => {
      testProduct = await Product.create(generateProduct({
        brand: testBrand._id,
        category: testCategory._id
      }));
    });

    it('should get product by id successfully', async () => {
      const response = await request(app)
        .get(`/products/${testProduct._id}`)
        .expect(200);

      expect(response.body._id.toString()).toBe(testProduct._id.toString());
      expect(response.body.title).toBe(testProduct.title);
    });
  });

  describe('updateById Product - Real Database Tests', () => {
    beforeEach(async () => {
      testProduct = await Product.create(generateProduct({
        brand: testBrand._id,
        category: testCategory._id
      }));
    });

    it('should update product successfully', async () => {
      const updateData = { title: 'Updated Title', price: 999 };
      
      const response = await request(app)
        .put(`/products/${testProduct._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.price).toBe(updateData.price);
    });
  });

  describe('deleteById Product - Real Database Tests', () => {
    beforeEach(async () => {
      testProduct = await Product.create(generateProduct({
        brand: testBrand._id,
        category: testCategory._id,
        isDeleted: false
      }));
    });

    it('should soft delete product successfully', async () => {
      const response = await request(app)
        .delete(`/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.isDeleted).toBe(true);
    });
  });
});
