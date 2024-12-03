const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err);

    // Mongoose duplicate key
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: '数据已存在'
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            message
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: '无效的令牌'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: '令牌已过期'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || '服务器错误'
    });
};

module.exports = { errorHandler };
