const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../utils/logger');

let mongoServer;

// Connect to the in-memory database
module.exports.connect = async () => {
    try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        logger.info('Connected to in-memory MongoDB');
    } catch (err) {
        logger.error('Error connecting to in-memory MongoDB:', err);
        throw err;
    }
};

// Clear all test data after every test
module.exports.clearDatabase = async () => {
    try {
        const collections = mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }

        logger.info('Test database cleared');
    } catch (err) {
        logger.error('Error clearing test database:', err);
        throw err;
    }
};

// Drop database, close the connection and stop mongod
module.exports.closeDatabase = async () => {
    try {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();

        logger.info('Test database connection closed');
    } catch (err) {
        logger.error('Error closing test database:', err);
        throw err;
    }
};
