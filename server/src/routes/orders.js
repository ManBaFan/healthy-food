const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'name email')
            .populate('items.menuItem')
            .populate('couponApplied')
            .select('-__v');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const order = await Order.create({
            ...req.body,
            customer: req.user._id // This will be set by auth middleware
        });
        
        const populatedOrder = await order
            .populate('customer', 'name email')
            .populate('items.menuItem')
            .populate('couponApplied')
            .execPopulate();
            
        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('items.menuItem')
            .populate('couponApplied')
            .select('-__v');
            
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        )
        .populate('customer', 'name email')
        .populate('items.menuItem')
        .populate('couponApplied');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
});

// Get orders by customer
router.get('/customer/:customerId', async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.params.customerId })
            .populate('customer', 'name email')
            .populate('items.menuItem')
            .populate('couponApplied')
            .select('-__v');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer orders', error: error.message });
    }
});

// Get orders by status
router.get('/status/:status', async (req, res) => {
    try {
        const orders = await Order.find({ status: req.params.status })
            .populate('customer', 'name email')
            .populate('items.menuItem')
            .populate('couponApplied')
            .select('-__v');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders by status', error: error.message });
    }
});

// Cancel order
router.patch('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        if (order.status === '已完成' || order.status === '已取消') {
            return res.status(400).json({ 
                message: '无法取消已完成或已取消的订单' 
            });
        }
        
        order.status = '已取消';
        await order.save();
        
        const populatedOrder = await order
            .populate('customer', 'name email')
            .populate('items.menuItem')
            .populate('couponApplied')
            .execPopulate();
            
        res.json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error canceling order', error: error.message });
    }
});

module.exports = router;
