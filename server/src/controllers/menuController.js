const MenuItem = require('../models/Menu');
const logger = require('../utils/logger');

// @desc    Get all menu items with filtering, sorting, and pagination
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res) => {
    try {
        const query = { isAvailable: true };

        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Filter by tags
        if (req.query.tags) {
            query.tags = { $in: req.query.tags.split(',') };
        }

        // Filter by allergens (excluding)
        if (req.query.excludeAllergens) {
            query.allergens = { $nin: req.query.excludeAllergens.split(',') };
        }

        // Price range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        // Nutrition filters
        if (req.query.maxCalories) {
            query['nutritionInfo.calories'] = { $lte: Number(req.query.maxCalories) };
        }

        // Search
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Sorting
        const sort = {};
        if (req.query.sort) {
            const parts = req.query.sort.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        const items = await MenuItem.find(query)
            .sort(sort)
            .skip(startIndex)
            .limit(limit)
            .populate('createdBy', 'name');

        const total = await MenuItem.countDocuments(query);

        res.status(200).json({
            success: true,
            count: items.length,
            total,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit)
            },
            data: items
        });
    } catch (error) {
        logger.error('Error in getMenuItems:', error);
        res.status(500).json({
            success: false,
            message: '获取菜单失败'
        });
    }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private (Admin/Staff)
exports.createMenuItem = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        
        const menuItem = await MenuItem.create(req.body);

        res.status(201).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        logger.error('Error in createMenuItem:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Admin/Staff)
exports.updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: '未找到该菜品'
            });
        }

        res.status(200).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        logger.error('Error in updateMenuItem:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete menu item (soft delete)
// @route   DELETE /api/menu/:id
// @access  Private (Admin)
exports.deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { isAvailable: false },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: '未找到该菜品'
            });
        }

        res.status(200).json({
            success: true,
            message: '菜品已下架'
        });
    } catch (error) {
        logger.error('Error in deleteMenuItem:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
