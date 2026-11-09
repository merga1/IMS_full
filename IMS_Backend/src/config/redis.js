import Redis from "ioredis";
import { logger } from "../shared/utils/logger.js";

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// In-memory fallback map for development when Redis server is not running
const inMemoryStore = new Map();
let isRedisAvailable = false;

let redisClient = null;

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 2) {
        return null; // Stop retrying after 2 attempts
      }
      return 200;
    },
  });

  redisClient.connect().then(() => {
    isRedisAvailable = true;
    logger.info('Redis connected successfully');
  }).catch(() => {
    isRedisAvailable = false;
    logger.warn('Redis offline: Using in-memory store for session management');
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    logger.info('Redis connected successfully');
  });

  redisClient.on('error', () => {
    isRedisAvailable = false;
  });
} catch {
  isRedisAvailable = false;
}

const redis = {
  async set(key, value, ...args) {
    if (isRedisAvailable && redisClient) {
      try {
        return await redisClient.set(key, value, ...args);
      } catch {
        isRedisAvailable = false;
      }
    }
    const expirationArg = args.findIndex((arg) => String(arg).toUpperCase() === 'EX');
    const ttlSeconds = expirationArg >= 0 ? Number(args[expirationArg + 1]) : 0;
    inMemoryStore.set(key, {
      value,
      expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
    });
    return 'OK';
  },

  async get(key) {
    if (isRedisAvailable && redisClient) {
      try {
        return await redisClient.get(key);
      } catch {
        isRedisAvailable = false;
      }
    }
    const cached = inMemoryStore.get(key);
    if (!cached) return null;
    if (cached.expiresAt && cached.expiresAt <= Date.now()) {
      inMemoryStore.delete(key);
      return null;
    }
    return cached.value;
  },

  async del(key) {
    if (isRedisAvailable && redisClient) {
      try {
        return await redisClient.del(key);
      } catch {
        isRedisAvailable = false;
      }
    }
    inMemoryStore.delete(key);
    return 1;
  },

  on(event, handler) {
    if (redisClient) {
      redisClient.on(event, handler);
    }
  }
};

export default redis;
