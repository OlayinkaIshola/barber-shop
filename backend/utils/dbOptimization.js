const mongoose = require('mongoose');

// Database connection optimization
const optimizeConnection = () => {
  // Connection pool settings
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected with optimized settings');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
  });

  // Optimize connection settings
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    bufferMaxEntries: 0, // Disable mongoose buffering
    bufferCommands: false, // Disable mongoose buffering
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
  };

  return connectionOptions;
};

// Query optimization helpers
class QueryOptimizer {
  static addPagination(query, page = 1, limit = 10, maxLimit = 100) {
    const normalizedPage = Math.max(1, parseInt(page));
    const normalizedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit)));
    const skip = (normalizedPage - 1) * normalizedLimit;
    
    return query.skip(skip).limit(normalizedLimit);
  }

  static addSorting(query, sortBy = 'createdAt', sortOrder = 'desc') {
    const order = sortOrder === 'asc' ? 1 : -1;
    return query.sort({ [sortBy]: order });
  }

  static addProjection(query, fields) {
    if (fields && Array.isArray(fields)) {
      const projection = fields.join(' ');
      return query.select(projection);
    }
    return query;
  }

  static addPopulation(query, populateOptions) {
    if (populateOptions && Array.isArray(populateOptions)) {
      populateOptions.forEach(option => {
        query = query.populate(option);
      });
    }
    return query;
  }

  static optimizeForReading(query) {
    return query.lean(); // Return plain JavaScript objects instead of Mongoose documents
  }

  static addFilters(query, filters = {}) {
    const mongoFilters = {};
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string') {
          // Text search with regex
          if (key.includes('search') || key.includes('name') || key.includes('title')) {
            mongoFilters[key.replace('search', '').replace('Search', '')] = {
              $regex: value,
              $options: 'i'
            };
          } else {
            mongoFilters[key] = value;
          }
        } else if (Array.isArray(value)) {
          mongoFilters[key] = { $in: value };
        } else if (typeof value === 'object') {
          // Handle date ranges, number ranges, etc.
          mongoFilters[key] = value;
        } else {
          mongoFilters[key] = value;
        }
      }
    });
    
    return query.find(mongoFilters);
  }

  static buildAggregationPipeline(options = {}) {
    const pipeline = [];
    
    // Match stage
    if (options.match) {
      pipeline.push({ $match: options.match });
    }
    
    // Lookup/Join stages
    if (options.lookups) {
      options.lookups.forEach(lookup => {
        pipeline.push({ $lookup: lookup });
      });
    }
    
    // Unwind stages
    if (options.unwinds) {
      options.unwinds.forEach(unwind => {
        pipeline.push({ $unwind: unwind });
      });
    }
    
    // Group stage
    if (options.group) {
      pipeline.push({ $group: options.group });
    }
    
    // Sort stage
    if (options.sort) {
      pipeline.push({ $sort: options.sort });
    }
    
    // Project stage
    if (options.project) {
      pipeline.push({ $project: options.project });
    }
    
    // Pagination
    if (options.skip) {
      pipeline.push({ $skip: options.skip });
    }
    
    if (options.limit) {
      pipeline.push({ $limit: options.limit });
    }
    
    return pipeline;
  }
}

// Index management
class IndexManager {
  static async createIndexes(model, indexes) {
    try {
      for (const index of indexes) {
        await model.createIndex(index.fields, index.options || {});
        console.log(`✅ Created index for ${model.modelName}:`, index.fields);
      }
    } catch (error) {
      console.error(`❌ Error creating indexes for ${model.modelName}:`, error);
    }
  }

  static async analyzeIndexUsage(model) {
    try {
      const stats = await model.collection.stats();
      const indexes = await model.collection.indexes();
      
      return {
        collectionName: model.modelName,
        documentCount: stats.count,
        totalIndexSize: stats.totalIndexSize,
        indexes: indexes.map(index => ({
          name: index.name,
          keys: index.key,
          size: index.size || 'N/A'
        }))
      };
    } catch (error) {
      console.error(`Error analyzing indexes for ${model.modelName}:`, error);
      return null;
    }
  }

  static getRecommendedIndexes() {
    return {
      User: [
        { fields: { email: 1 }, options: { unique: true } },
        { fields: { role: 1, isApproved: 1 } },
        { fields: { createdAt: -1 } }
      ],
      Booking: [
        { fields: { customer: 1, status: 1 } },
        { fields: { stylist: 1, date: 1 } },
        { fields: { date: 1, time: 1 } },
        { fields: { status: 1, createdAt: -1 } },
        { fields: { 'customerInfo.email': 1 } }
      ],
      Service: [
        { fields: { category: 1, price: 1 } },
        { fields: { name: 'text', description: 'text' } }
      ],
      Notification: [
        { fields: { recipient: 1, read: 1 } },
        { fields: { type: 1, createdAt: -1 } },
        { fields: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }
      ],
      RecurringBooking: [
        { fields: { customer: 1, status: 1 } },
        { fields: { stylist: 1, status: 1 } },
        { fields: { nextOccurrence: 1, status: 1 } }
      ],
      Waitlist: [
        { fields: { customer: 1, status: 1 } },
        { fields: { service: 1, status: 1 } },
        { fields: { status: 1, priority: -1, createdAt: 1 } },
        { fields: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }
      ]
    };
  }
}

// Performance monitoring
class PerformanceMonitor {
  static enableSlowQueryLogging() {
    mongoose.set('debug', (collectionName, method, query, doc) => {
      const start = Date.now();
      
      // Log slow queries (> 100ms)
      setTimeout(() => {
        const duration = Date.now() - start;
        if (duration > 100) {
          console.warn(`🐌 Slow query detected: ${collectionName}.${method}`, {
            query,
            duration: `${duration}ms`
          });
        }
      }, 0);
    });
  }

  static async getCollectionStats() {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const stats = [];

    for (const collection of collections) {
      try {
        const collStats = await db.collection(collection.name).stats();
        stats.push({
          name: collection.name,
          count: collStats.count,
          size: collStats.size,
          avgObjSize: collStats.avgObjSize,
          indexCount: collStats.nindexes,
          totalIndexSize: collStats.totalIndexSize
        });
      } catch (error) {
        console.error(`Error getting stats for ${collection.name}:`, error);
      }
    }

    return stats;
  }

  static async analyzeQueryPerformance(model, query) {
    const start = Date.now();
    
    try {
      const result = await query.explain('executionStats');
      const duration = Date.now() - start;
      
      return {
        duration,
        executionStats: result.executionStats,
        indexUsed: result.executionStats.totalKeysExamined > 0,
        documentsExamined: result.executionStats.totalDocsExamined,
        documentsReturned: result.executionStats.executionSuccess ? result.executionStats.totalDocsExamined : 0
      };
    } catch (error) {
      return {
        duration: Date.now() - start,
        error: error.message
      };
    }
  }
}

// Memory optimization
class MemoryOptimizer {
  static configureMongoose() {
    // Disable automatic index creation in production
    if (process.env.NODE_ENV === 'production') {
      mongoose.set('autoIndex', false);
    }

    // Set strict mode
    mongoose.set('strict', true);
    
    // Set strict query mode
    mongoose.set('strictQuery', true);
    
    // Optimize for memory usage
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferMaxEntries', 0);
  }

  static createLeanQuery(model, conditions = {}) {
    return model.find(conditions).lean();
  }

  static async streamLargeDataset(model, conditions, batchSize = 1000) {
    const cursor = model.find(conditions).lean().cursor({ batchSize });
    const results = [];
    
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      results.push(doc);
      
      // Process in batches to avoid memory issues
      if (results.length >= batchSize) {
        yield results.splice(0, batchSize);
      }
    }
    
    if (results.length > 0) {
      yield results;
    }
  }
}

// Cleanup utilities
class DatabaseCleaner {
  static async cleanupExpiredDocuments() {
    const models = [
      { model: mongoose.model('Notification'), field: 'expiresAt' },
      { model: mongoose.model('Waitlist'), field: 'expiresAt' }
    ];

    let totalCleaned = 0;

    for (const { model, field } of models) {
      try {
        const result = await model.deleteMany({
          [field]: { $lt: new Date() }
        });
        
        totalCleaned += result.deletedCount;
        console.log(`🧹 Cleaned ${result.deletedCount} expired documents from ${model.modelName}`);
      } catch (error) {
        console.error(`Error cleaning ${model.modelName}:`, error);
      }
    }

    return totalCleaned;
  }

  static async optimizeCollections() {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      try {
        await db.collection(collection.name).reIndex();
        console.log(`🔧 Reindexed collection: ${collection.name}`);
      } catch (error) {
        console.error(`Error reindexing ${collection.name}:`, error);
      }
    }
  }
}

module.exports = {
  optimizeConnection,
  QueryOptimizer,
  IndexManager,
  PerformanceMonitor,
  MemoryOptimizer,
  DatabaseCleaner
};
