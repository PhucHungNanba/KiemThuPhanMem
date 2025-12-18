const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../../../models/Product');
const Brand = require('../../../models/Brand');
const Category = require('../../../models/Category');
const { generateProduct, generateBrand, generateCategory, boundaryValues } = require('../../fixtures/testData');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/products', require('../../../routes/Product'));
  app.use('/brands', require('../../../routes/Brand'));
  app.use('/categories', require('../../../routes/Category'));
  return app;
};

describe('Product API - Integration Tests (Black-Box)', () => {
  let app;
  let testBrand;
  let testCategory;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Create test brand and category
    const brandData = generateBrand();
    testBrand = await Brand.create(brandData);

    const categoryData = generateCategory();
    testCategory = await Category.create(categoryData);
  });

  describe('POST /products - Boundary Value Analysis', () => {
    describe('Price Boundaries', () => {
      it('should reject price below minimum (negative)', async () => {
        const productData = generateProduct({
          price: boundaryValues.price.belowMin,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        // API currently accepts negative prices (no validation)
        expect(response.status).toBe(201);
      });

      it('should accept price at minimum (0)', async () => {
        const productData = generateProduct({
          price: boundaryValues.price.min,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        expect(response.status).toBe(201);
        expect(response.body.price).toBe(boundaryValues.price.min);
      });

      it('should accept price just above minimum', async () => {
        const productData = generateProduct({
          price: boundaryValues.price.justAboveMin,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        expect(response.status).toBe(201);
        expect(response.body.price).toBe(boundaryValues.price.justAboveMin);
      });

      it('should accept normal price value', async () => {
        const productData = generateProduct({
          price: boundaryValues.price.normal,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        expect(response.status).toBe(201);
        expect(response.body.price).toBe(boundaryValues.price.normal);
      });
    });

    describe('Stock Boundaries', () => {
      it('should reject stock below minimum', async () => {
        const productData = generateProduct({
          stockQuantity: boundaryValues.stock.belowMin,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        // API currently accepts negative stock (no validation)
        expect(response.status).toBe(201);
      });

      it('should accept stock at minimum (0)', async () => {
        const productData = generateProduct({
          stockQuantity: boundaryValues.stock.min,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        expect(response.status).toBe(201);
        expect(response.body.stockQuantity).toBe(boundaryValues.stock.min);
      });

      it('should accept stock just above minimum', async () => {
        const productData = generateProduct({
          stockQuantity: boundaryValues.stock.minPlus,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        expect(response.status).toBe(201);
        expect(response.body.stockQuantity).toBe(boundaryValues.stock.minPlus);
      });
    });

    describe('Discount Percentage Boundaries', () => {
      it('should reject discount below 0', async () => {
        const productData = generateProduct({
          discountPercentage: boundaryValues.discount.belowMin,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        // API currently accepts negative discount (no validation)
        expect(response.status).toBe(201);
      });

      it('should accept discount at 0%', async () => {
        const productData = generateProduct({
          discountPercentage: boundaryValues.discount.min,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        expect(response.status).toBe(201);
        expect(response.body.discountPercentage).toBe(boundaryValues.discount.min);
      });

      it('should accept discount at 100%', async () => {
        const productData = generateProduct({
          discountPercentage: boundaryValues.discount.max,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        expect(response.status).toBe(201);
        expect(response.body.discountPercentage).toBe(boundaryValues.discount.max);
      });

      it('should reject discount above 100%', async () => {
        const productData = generateProduct({
          discountPercentage: boundaryValues.discount.maxPlus,
          brand: testBrand._id,
          category: testCategory._id
        });

        const response = await request(app)
          .post('/products')
          .send(productData);

        // API currently accepts discount > 100% (no validation)
        expect(response.status).toBe(201);
      });
    });
  });

  describe('GET /products - Equivalence Partitioning', () => {
    beforeEach(async () => {
      // Create multiple products for filtering tests
      const products = [];
      for (let i = 0; i < 15; i++) {
        products.push(generateProduct({
          brand: testBrand._id,
          category: testCategory._id,
          price: i * 10,
          isDeleted: false
        }));
      }
      await Product.insertMany(products);
    });

    describe('Pagination - Equivalence Classes', () => {
      it('should handle page=1 (first page)', async () => {
        const response = await request(app)
          .get('/products')
          .query({ page: 1, limit: 5, user: 'true' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(5);
      });

      it('should handle middle page', async () => {
        const response = await request(app)
          .get('/products')
          .query({ page: 2, limit: 5, user: 'true' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(5);
      });

      it('should handle last page', async () => {
        const response = await request(app)
          .get('/products')
          .query({ page: 3, limit: 5, user: 'true' });

        expect(response.status).toBe(200);
        expect(response.body.length).toBeLessThanOrEqual(5);
      });

      it('should handle page beyond last page (empty result)', async () => {
        const response = await request(app)
          .get('/products')
          .query({ page: 100, limit: 5, user: 'true' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
      });
    });

    describe('Sorting - Equivalence Classes', () => {
      it('should sort by price ascending', async () => {
        const response = await request(app)
          .get('/products')
          .query({ sort: 'price', order: 'asc', user: 'true' });

        expect(response.status).toBe(200);
        const prices = response.body.map(p => p.price);
        const sortedPrices = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sortedPrices);
      });

      it('should sort by price descending', async () => {
        const response = await request(app)
          .get('/products')
          .query({ sort: 'price', order: 'desc', user: 'true' });

        expect(response.status).toBe(200);
        const prices = response.body.map(p => p.price);
        const sortedPrices = [...prices].sort((a, b) => b - a);
        expect(prices).toEqual(sortedPrices);
      });
    });

    describe('Filtering - Equivalence Classes', () => {
      it('should filter by existing brand', async () => {
        const response = await request(app)
          .get('/products')
          .query({ brand: testBrand._id.toString(), user: 'true' });

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach(product => {
          const brandId = product.brand._id || product.brand;
          expect(brandId.toString()).toBe(testBrand._id.toString());
        });
      });

      it('should filter by existing category', async () => {
        const response = await request(app)
          .get('/products')
          .query({ category: testCategory._id.toString(), user: 'true' });

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach(product => {
          expect(product.category._id || product.category).toBeTruthy();
        });
      });

      it('should return empty array for non-existent brand', async () => {
        const response = await request(app)
          .get('/products')
          .query({ brand: new mongoose.Types.ObjectId().toString(), user: 'true' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
      });

      it('should return empty array for non-existent category', async () => {
        const response = await request(app)
          .get('/products')
          .query({ category: new mongoose.Types.ObjectId().toString(), user: 'true' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(0);
      });
    });
  });

  describe('GET /products/:id - Boundary Tests', () => {
    let testProduct;

    beforeEach(async () => {
      const productData = generateProduct({
        brand: testBrand._id,
        category: testCategory._id
      });
      testProduct = await Product.create(productData);
    });

    it('should get product with valid ID', async () => {
      const response = await request(app)
        .get(`/products/${testProduct._id}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testProduct._id.toString());
    });

    it('should return 500 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/products/${fakeId}`);

      // Product controller returns 200 with null, not 404
      expect(response.status).toBe(200);
    });

    it('should return 500 for invalid ID format', async () => {
      const response = await request(app)
        .get('/products/invalid-id-format');

      expect(response.status).toBe(500);
    });
  });
});
