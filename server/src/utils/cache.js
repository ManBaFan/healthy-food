const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3
});

redis.on('error', (err) => {
    logger.error('Redis Client Error:', err);
});

redis.on('connect', () => {
    logger.info('Redis Client Connected');
});

const DEFAULT_EXPIRATION = 3600; // 1 hour in seconds

const cacheMiddleware = (keyPrefix, expiration = DEFAULT_EXPIRATION) => {
    return async (req, res, next) => {
        try {
            const key = `${keyPrefix}:${req.originalUrl}`;
            const cachedData = await redis.get(key);

            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }

            // Store the original res.json function
            const originalJson = res.json;

            // Override res.json to cache the response before sending
            res.json = function(data) {
                redis.setex(key, expiration, JSON.stringify(data))
                    .catch(err => logger.error('Redis cache error:', err));
                
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error:', error);
            next();
        }
    };
};

const clearCache = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
        }
    } catch (error) {
        logger.error('Clear cache error:', error);
    }
};

module.exports = {
    redis,
    cacheMiddleware,
    clearCache,
    DEFAULT_EXPIRATION
};
