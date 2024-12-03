const mongoose = require('mongoose');
const logger = require('./logger');
const config = require('../config/database');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        logger.info('Using existing database connection');
        return;
    }

    try {
        const conn = await mongoose.connect(config.mongodb.url, config.mongodb.options);
        isConnected = true;
        
        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
            if (!isConnected) {
                process.exit(1);
            }
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting to reconnect...');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
            isConnected = true;
        });

        // Gracefully close the connection when the app terminates
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

const cleanup = async () => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        logger.error(`Error during MongoDB cleanup: ${err}`);
        process.exit(1);
    }
};

module.exports = { connectDB };
