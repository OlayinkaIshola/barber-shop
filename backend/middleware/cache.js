const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
});

// Connect to Redis
client.on('error', (err) => {
  console.log('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Initialize Redis connection
const connectRedis = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.log('❌ Redis connection failed:', error.message);
    console.log('Continuing without Redis cache...');
  }
};

// Cache middleware
const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not available
    if (!client.isOpen) {
      return next();
    }

    // Skip caching for authenticated requests
    if (req.headers.authorization) {
      return next();
    }

    // Create cache key
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get cached data
      const cachedData = await client.get(key);
      
      if (cachedData) {
        console.log(`Cache hit for ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response
        client.setEx(key, duration, JSON.stringify(data))
          .catch(err => console.log('Cache set error:', err));
        
        console.log(`Cache set for ${key} (${duration}s)`);
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.log('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation helpers
const invalidateCache = async (pattern) => {
  if (!client.isOpen) return;
  
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`Invalidated ${keys.length} cache entries matching ${pattern}`);
    }
  } catch (error) {
    console.log('Cache invalidation error:', error);
  }
};

const invalidateUserCache = async (userId) => {
  await invalidateCache(`cache:*user*${userId}*`);
  await invalidateCache(`cache:*/api/bookings/my-bookings*`);
};

const invalidateBookingCache = async () => {
  await invalidateCache('cache:*/api/bookings*');
  await invalidateCache('cache:*/api/analytics*');
};

const invalidateServiceCache = async () => {
  await invalidateCache('cache:*/api/services*');
  await invalidateCache('cache:*/api/stylists*');
};

const invalidateReviewCache = async () => {
  await invalidateCache('cache:*/api/reviews*');
  await invalidateCache('cache:*/api/stylists*');
};

// Memory cache for frequently accessed data
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttl = 300000) { // 5 minutes default
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value
    this.cache.set(key, value);

    // Set expiration timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.cache.delete(key);
  }

  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const memoryCache = new MemoryCache();

// Memory cache middleware
const memCache = (duration = 300000) => {
  return (req, res, next) => {
    // Skip caching for authenticated requests
    if (req.headers.authorization) {
      return next();
    }

    const key = `mem:${req.originalUrl || req.url}`;

    // Check if data exists in memory cache
    if (memoryCache.has(key)) {
      console.log(`Memory cache hit for ${key}`);
      return res.json(memoryCache.get(key));
    }

    // Store original res.json
    const originalJson = res.json;

    // Override res.json to cache the response
    res.json = function(data) {
      // Cache the response in memory
      memoryCache.set(key, data, duration);
      console.log(`Memory cache set for ${key} (${duration}ms)`);
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Rate limiting with Redis
const createRateLimiter = (windowMs, max, message) => {
  return async (req, res, next) => {
    if (!client.isOpen) {
      return next();
    }

    const key = `rate_limit:${req.ip}:${req.route?.path || req.path}`;
    
    try {
      const current = await client.incr(key);
      
      if (current === 1) {
        await client.expire(key, Math.ceil(windowMs / 1000));
      }
      
      if (current > max) {
        return res.status(429).json({
          success: false,
          error: message || 'Too many requests, please try again later.'
        });
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': Math.max(0, max - current),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs)
      });
      
      next();
    } catch (error) {
      console.log('Rate limiter error:', error);
      next();
    }
  };
};

// Database query optimization helpers
const optimizeQuery = (query) => {
  // Add lean() for read-only operations
  if (typeof query.lean === 'function') {
    query = query.lean();
  }
  
  return query;
};

const addPagination = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

// Cleanup function
const cleanup = async () => {
  try {
    if (client.isOpen) {
      await client.quit();
    }
    memoryCache.clear();
  } catch (error) {
    console.log('Cache cleanup error:', error);
  }
};

module.exports = {
  connectRedis,
  cache,
  memCache,
  invalidateCache,
  invalidateUserCache,
  invalidateBookingCache,
  invalidateServiceCache,
  invalidateReviewCache,
  memoryCache,
  createRateLimiter,
  optimizeQuery,
  addPagination,
  cleanup
};
