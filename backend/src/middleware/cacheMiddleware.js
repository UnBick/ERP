const NodeCache = require('node-cache');

// Initialize cache with 5 minutes standard TTL
const cache = new NodeCache({ stdTTL: 300 });

const cacheMiddleware = (duration, keyGenerator) => {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = keyGenerator ? keyGenerator(req) : req.originalUrl;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            console.log(`Cache hit for key: ${key}`);
            return res.json(cachedResponse);
        }

        // Store original send function
        const originalSend = res.json;

        // Override res.json method
        res.json = function(body) {
            // Store the response in cache
            cache.set(key, body, duration);
            
            // Call original send function
            return originalSend.call(this, body);
        };

        next();
    };
};

// Helper functions
cacheMiddleware.set = (key, value, ttl) => cache.set(key, value, ttl);
cacheMiddleware.get = (key) => cache.get(key);
cacheMiddleware.del = (key) => cache.del(key);
cacheMiddleware.flush = () => cache.flushAll();
cacheMiddleware.stats = () => cache.getStats();

module.exports = cacheMiddleware;
