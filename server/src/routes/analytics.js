const express = require('express');
const router = express.Router();

// Mock analytics data store (replace with database in production)
let analyticsData = {
    userMetrics: [],
    recipeMetrics: [],
    orderMetrics: []
};

// Track user activity
router.post('/track/user', async (req, res) => {
    try {
        const { userId, action, timestamp, metadata } = req.body;

        const event = {
            id: analyticsData.userMetrics.length + 1,
            userId,
            action,
            timestamp: timestamp || new Date(),
            metadata: metadata || {},
            createdAt: new Date()
        };

        analyticsData.userMetrics.push(event);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error tracking user activity' });
    }
});

// Track recipe interactions
router.post('/track/recipe', async (req, res) => {
    try {
        const { recipeId, action, userId, timestamp, metadata } = req.body;

        const event = {
            id: analyticsData.recipeMetrics.length + 1,
            recipeId,
            action,
            userId,
            timestamp: timestamp || new Date(),
            metadata: metadata || {},
            createdAt: new Date()
        };

        analyticsData.recipeMetrics.push(event);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error tracking recipe interaction' });
    }
});

// Track order events
router.post('/track/order', async (req, res) => {
    try {
        const { orderId, status, userId, timestamp, metadata } = req.body;

        const event = {
            id: analyticsData.orderMetrics.length + 1,
            orderId,
            status,
            userId,
            timestamp: timestamp || new Date(),
            metadata: metadata || {},
            createdAt: new Date()
        };

        analyticsData.orderMetrics.push(event);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error tracking order event' });
    }
});

// Get user activity metrics
router.get('/metrics/users', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let metrics = analyticsData.userMetrics;
        
        if (startDate && endDate) {
            metrics = metrics.filter(m => {
                const timestamp = new Date(m.timestamp);
                return timestamp >= new Date(startDate) && timestamp <= new Date(endDate);
            });
        }

        const summary = {
            totalEvents: metrics.length,
            actionBreakdown: metrics.reduce((acc, curr) => {
                acc[curr.action] = (acc[curr.action] || 0) + 1;
                return acc;
            }, {}),
            timeRange: {
                start: startDate || 'all time',
                end: endDate || 'present'
            }
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user metrics' });
    }
});

// Get recipe interaction metrics
router.get('/metrics/recipes', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let metrics = analyticsData.recipeMetrics;
        
        if (startDate && endDate) {
            metrics = metrics.filter(m => {
                const timestamp = new Date(m.timestamp);
                return timestamp >= new Date(startDate) && timestamp <= new Date(endDate);
            });
        }

        const summary = {
            totalInteractions: metrics.length,
            recipeBreakdown: metrics.reduce((acc, curr) => {
                acc[curr.recipeId] = acc[curr.recipeId] || { total: 0, actions: {} };
                acc[curr.recipeId].total++;
                acc[curr.recipeId].actions[curr.action] = (acc[curr.recipeId].actions[curr.action] || 0) + 1;
                return acc;
            }, {}),
            timeRange: {
                start: startDate || 'all time',
                end: endDate || 'present'
            }
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipe metrics' });
    }
});

// Get order metrics
router.get('/metrics/orders', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let metrics = analyticsData.orderMetrics;
        
        if (startDate && endDate) {
            metrics = metrics.filter(m => {
                const timestamp = new Date(m.timestamp);
                return timestamp >= new Date(startDate) && timestamp <= new Date(endDate);
            });
        }

        const summary = {
            totalOrders: metrics.length,
            statusBreakdown: metrics.reduce((acc, curr) => {
                acc[curr.status] = (acc[curr.status] || 0) + 1;
                return acc;
            }, {}),
            timeRange: {
                start: startDate || 'all time',
                end: endDate || 'present'
            }
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order metrics' });
    }
});

module.exports = router;
