const config = {
    mongodb: {
        url: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthy-food',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        }
    },
    redis: {
        url: process.env.REDIS_URI || 'redis://localhost:6379',
        options: {
            maxRetriesPerRequest: 1,
            enableReadyCheck: true,
            maxReconnectAttempts: 10
        }
    }
};

module.exports = config;
