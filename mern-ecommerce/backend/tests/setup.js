const mongoose = require('mongoose');

let mongoServer;
const USE_ATLAS = process.env.USE_ATLAS === 'true';

// Setup before all tests
beforeAll(async () => {
  // Load test environment variables
  require('dotenv').config({ path: '.env.test' });
  
  if (USE_ATLAS) {
    // Connect to MongoDB Atlas
    console.log('🌐 Connecting to MongoDB Atlas...');
    
    const ATLAS_URI = process.env.MONGODB_ATLAS_TEST_URI || process.env.MONGODB_URI;
    
    if (!ATLAS_URI) {
      throw new Error('MONGODB_ATLAS_TEST_URI not found in .env.test');
    }
    
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } else {
    // Use In-Memory MongoDB
    console.log('💾 Using In-Memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log('✅ In-Memory MongoDB ready');
  }
});

// Cleanup after each test
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Global test timeout (increase for Atlas)
jest.setTimeout(USE_ATLAS ? 60000 : 30000);

// Don't mock console when using Atlas (để xem logs)
if (!USE_ATLAS) {
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };
}
