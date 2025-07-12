"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.deleteCache = exports.getCache = exports.setCache = exports.disconnectRedis = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
let redisClient;
const connectRedis = async () => {
    try {
        const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
        redisClient = (0, redis_1.createClient)({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger_1.logger.error('Redis max reconnection attempts reached');
                        return new Error('Redis max reconnection attempts reached');
                    }
                    return Math.min(retries * 100, 3000);
                },
            },
        });
        redisClient.on('error', (err) => {
            logger_1.logger.error('Redis Client Error:', err);
        });
        redisClient.on('connect', () => {
        });
        redisClient.on('ready', () => {
        });
        redisClient.on('end', () => {
            logger_1.logger.warn('Redis connection ended');
        });
        await redisClient.connect();
    }
    catch (error) {
        logger_1.logger.error('Redis connection failed:', error);
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call connectRedis() first.');
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const disconnectRedis = async () => {
    try {
        if (redisClient) {
            await redisClient.quit();
            logger_1.logger.info('Redis disconnected successfully');
        }
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting from Redis:', error);
    }
};
exports.disconnectRedis = disconnectRedis;
const setCache = async (key, value, ttl) => {
    try {
        if (!redisClient)
            return;
        const serializedValue = JSON.stringify(value);
        if (ttl) {
            await redisClient.setEx(key, ttl, serializedValue);
        }
        else {
            await redisClient.set(key, serializedValue);
        }
    }
    catch (error) {
        logger_1.logger.error('Error setting cache:', error);
    }
};
exports.setCache = setCache;
const getCache = async (key) => {
    try {
        if (!redisClient)
            return null;
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    }
    catch (error) {
        logger_1.logger.error('Error getting cache:', error);
        return null;
    }
};
exports.getCache = getCache;
const deleteCache = async (key) => {
    try {
        if (!redisClient)
            return;
        await redisClient.del(key);
    }
    catch (error) {
        logger_1.logger.error('Error deleting cache:', error);
    }
};
exports.deleteCache = deleteCache;
const clearCache = async (pattern) => {
    try {
        if (!redisClient)
            return;
        if (pattern) {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        }
        else {
            await redisClient.flushDb();
        }
    }
    catch (error) {
        logger_1.logger.error('Error clearing cache:', error);
    }
};
exports.clearCache = clearCache;
//# sourceMappingURL=redis.js.map