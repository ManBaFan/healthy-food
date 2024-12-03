const Order = require('../models/Order');
const MenuItem = require('../models/Menu');
const logger = require('../utils/logger');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        // Add user to req.body
        req.body.customer = req.user.id;

        // Validate items and calculate total
        const itemPromises = req.body.items.map(async (item) => {
            const menuItem = await MenuItem.findById(item.menuItem);
            if (!menuItem || !menuItem.isAvailable) {
                throw new Error(`菜品 ${item.menuItem} 不可用`);
            }
            return {
                ...item,
                price: menuItem.price
            };
        });

        const validatedItems = await Promise.all(itemPromises);
        req.body.items = validatedItems;

        const order = await Order.create(req.body);

        // Populate necessary fields
        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'name email')
            .populate('items.menuItem', 'name nameEn price');

        res.status(201).json({
            success: true,
            data: populatedOrder
        });
    } catch (error) {
        logger.error('Error in createOrder:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders with filtering and pagination
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const query = {};

        // Filter by customer for regular users
        if (req.user.role === 'user') {
            query.customer = req.user.id;
        }

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by date range
        if (req.query.startDate && req.query.endDate) {
            query.createdAt = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const orders = await Order.find(query)
            .populate('customer', 'name email')
            .populate('items.menuItem', 'name nameEn price')
            .sort('-createdAt')
            .skip(startIndex)
            .limit(limit);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit)
            },
            data: orders
        });
    } catch (error) {
        logger.error('Error in getOrders:', error);
        res.status(500).json({
            success: false,
            message: '获取订单失败'
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Staff)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '未找到该订单'
            });
        }

        // Validate status transition
        const validTransitions = {
            '待支付': ['已支付', '已取消'],
            '已支付': ['准备中', '已取消'],
            '准备中': ['配送中', '已取消'],
            '配送中': ['已完成', '已取消'],
            '已完成': [],
            '已取消': []
        };

        if (!validTransitions[order.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '无效的状态更新'
            });
        }

        order.status = status;
        order.statusHistory.push({ status, note });

        if (status === '配送中') {
            order.deliveryTime.actual = new Date();
        }

        await order.save();

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        logger.error('Error in updateOrderStatus:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private (Admin)
exports.getOrderStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    orderCount: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error in getOrderStats:', error);
        res.status(500).json({
            success: false,
            message: '获取统计数据失败'
        });
    }
};
