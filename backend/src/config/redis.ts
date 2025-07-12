import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max reconnection attempts reached');
            return new Error('Redis max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      // Redis connected successfully
    });

    redisClient.on('ready', () => {
      // Redis ready to accept commands
    });

    redisClient.on('end', () => {
      logger.warn('Redis connection ended');
    });

    await redisClient.connect();
    
  } catch (error) {
    logger.error('Redis connection failed:', error);
    // Don't exit process for Redis connection failure
    // App can still work without Redis
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis disconnected successfully');
    }
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
};

// Cache utility functions
export const setCache = async (key: string, value: any, ttl?: number): Promise<void> => {
  try {
    if (!redisClient) return;
    
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await redisClient.setEx(key, ttl, serializedValue);
    } else {
      await redisClient.set(key, serializedValue);
    }
  } catch (error) {
    logger.error('Error setting cache:', error);
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    if (!redisClient) return null;
    
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Error getting cache:', error);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    if (!redisClient) return;
    
    await redisClient.del(key);
  } catch (error) {
    logger.error('Error deleting cache:', error);
  }
};

export const clearCache = async (pattern?: string): Promise<void> => {
  try {
    if (!redisClient) return;
    
    if (pattern) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      await redisClient.flushDb();
    }
  } catch (error) {
    logger.error('Error clearing cache:', error);
  }
}; 