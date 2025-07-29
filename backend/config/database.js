const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // Validate MongoDB URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Use MongoDB Memory Server for development if specified
    if (process.env.USE_MEMORY_DB === 'true' && process.env.NODE_ENV === 'development') {
      console.log('🔄 Starting MongoDB Memory Server...');
      try {
        mongod = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            dbName: 'elite-barber-shop'
          }
        });
        mongoUri = mongod.getUri();
        console.log('✅ MongoDB Memory Server started');
      } catch (memoryServerError) {
        console.warn('⚠️ MongoDB Memory Server failed, using regular connection:', memoryServerError.message);
        // Continue with regular connection
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ Connected to MongoDB: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    // If MongoDB Memory Server fails, try regular connection
    if (process.env.USE_MEMORY_DB === 'true' && process.env.MONGODB_URI) {
      console.log('🔄 Falling back to regular MongoDB connection...');
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log(`✅ Connected to MongoDB: ${conn.connection.host}:${conn.connection.port}`);
        return conn;
      } catch (fallbackError) {
        console.error('❌ Fallback MongoDB connection also failed:', fallbackError.message);
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    
    if (mongod) {
      await mongod.stop();
      console.log('🛑 MongoDB Memory Server stopped');
    }
    
    console.log('🛑 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
