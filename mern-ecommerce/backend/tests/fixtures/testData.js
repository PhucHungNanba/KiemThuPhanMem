const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

/**
 * Generate test user data
 */
const generateUser = async (overrides = {}) => {
  const password = faker.internet.password();
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: await bcrypt.hash(password, 1),
    plainPassword: password, // For testing login
    ...overrides
  };
};

/**
 * Generate test product data
 */
const generateProduct = (overrides = {}) => {
  return {
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    discountPercentage: faker.number.int({ min: 0, max: 50 }),
    stockQuantity: faker.number.int({ min: 0, max: 1000 }),
    brand: faker.company.name(),
    category: faker.commerce.department(),
    thumbnail: faker.image.url(),
    images: [faker.image.url(), faker.image.url()],
    ...overrides
  };
};

/**
 * Generate test address data
 */
const generateAddress = (userId, overrides = {}) => {
  return {
    user: userId,
    name: faker.person.fullName(),
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    pinCode: faker.location.zipCode(),
    phone: faker.phone.number(),
    type: faker.helpers.arrayElement(['home', 'office', 'other']),
    country: faker.location.country(),
    postalCode: faker.location.zipCode(),
    phoneNumber: faker.phone.number(),
    ...overrides
  };
};

/**
 * Generate test order data
 */
const generateOrder = (userId, overrides = {}) => {
  const items = [];
  const itemCount = faker.number.int({ min: 1, max: 5 });
  
  for (let i = 0; i < itemCount; i++) {
    items.push({
      product: null, // Will be filled with actual product ID
      quantity: faker.number.int({ min: 1, max: 5 }),
      price: parseFloat(faker.commerce.price())
    });
  }
  
  return {
    user: userId,
    items,
    totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    paymentMethod: faker.helpers.arrayElement(['card', 'cash']),
    status: faker.helpers.arrayElement(['pending', 'dispatched', 'delivered', 'cancelled']),
    selectedAddress: null, // Will be filled with actual address
    ...overrides
  };
};

/**
 * Generate test review data
 */
const generateReview = (userId, productId, overrides = {}) => {
  return {
    user: userId,
    product: productId,
    rating: faker.number.int({ min: 1, max: 5 }),
    comment: faker.lorem.paragraph(),
    ...overrides
  };
};

/**
 * Generate test category data
 */
const generateCategory = (overrides = {}) => {
  return {
    name: faker.commerce.department(),
    ...overrides
  };
};

/**
 * Generate test brand data
 */
const generateBrand = (overrides = {}) => {
  return {
    name: faker.company.name(),
    ...overrides
  };
};

/**
 * Boundary value test data generator
 */
const boundaryValues = {
  price: {
    belowMin: -1,
    min: 0,
    justAboveMin: 0.01,
    normal: 100,
    justBelowMax: 999999.99,
    max: 1000000,
    aboveMax: 1000001
  },
  stock: {
    belowMin: -1,
    min: 0,
    minPlus: 1,
    nominal: 50,
    maxMinus: 9999,
    max: 10000,
    maxPlus: 10001
  },
  discount: {
    belowMin: -1,
    min: 0,
    minPlus: 1,
    nominal: 25,
    maxMinus: 99,
    max: 100,
    maxPlus: 101
  }
};

/**
 * Equivalence partitioning test cases
 */
const equivalenceClasses = {
  email: {
    valid: [
      'user@example.com',
      'test.user@domain.co.uk',
      'user+tag@example.com'
    ],
    invalid: [
      'invalid-email',
      '@example.com',
      'user@',
      'user@.com',
      ''
    ]
  },
  password: {
    valid: [
      'Password123!',
      'SecurePass1@',
      'MyP@ssw0rd'
    ],
    invalid: [
      '123',           // Too short
      'password',      // No uppercase or special char
      'PASSWORD',      // No lowercase
      '12345678'       // No letters
    ]
  },
  phoneNumber: {
    valid: [
      '1234567890',
      '+911234567890',
      '(123) 456-7890'
    ],
    invalid: [
      '123',
      'abcdefghij',
      ''
    ]
  }
};

/**
 * Generate product with actual Brand and Category ObjectIds (for E2E tests)
 * Requires Brand and Category models to be imported in the test file
 */
const generateProductWithRefs = async (Brand, Category, overrides = {}) => {
  // Create brand and category if not provided
  let brand = overrides.brand;
  let category = overrides.category;
  
  if (!brand) {
    const brandData = generateBrand();
    const brandDoc = await Brand.create(brandData);
    brand = brandDoc._id;
  }
  
  if (!category) {
    const categoryData = generateCategory();
    const categoryDoc = await Category.create(categoryData);
    category = categoryDoc._id;
  }
  
  return generateProduct({
    ...overrides,
    brand,
    category
  });
};

module.exports = {
  generateUser,
  generateProduct,
  generateProductWithRefs,
  generateAddress,
  generateOrder,
  generateReview,
  generateCategory,
  generateBrand,
  boundaryValues,
  equivalenceClasses
};
