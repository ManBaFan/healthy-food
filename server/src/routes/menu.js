const express = require('express');
const MenuItem = require('../models/Menu');
const { cacheMiddleware, clearCache } = require('../utils/cache');
const router = express.Router();

// Get all menu items
router.get('/', cacheMiddleware('menu:all'), async (req, res) => {
    try {
        const menuItems = await MenuItem.find()
            .populate('createdBy', 'name email')
            .select('-__v');
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
});

// Create new menu item
router.post('/', async (req, res) => {
    try {
        const menuItem = await MenuItem.create({
            ...req.body,
            createdBy: req.user._id // This will be set by auth middleware
        });
        await clearCache('menu:*');
        res.status(201).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu item', error: error.message });
    }
});

// Get menu item by ID
router.get('/:id', cacheMiddleware('menu:item'), async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('reviews')
            .select('-__v');
            
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu item', error: error.message });
    }
});

// Update menu item
router.put('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        await clearCache('menu:*');
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error: error.message });
    }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
        
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        await clearCache('menu:*');
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting menu item', error: error.message });
    }
});

// Search menu items
router.get('/search/:query', cacheMiddleware('menu:search'), async (req, res) => {
    try {
        const menuItems = await MenuItem.find(
            { $text: { $search: req.params.query } },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .populate('createdBy', 'name email')
        .select('-__v');
        
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Error searching menu items', error: error.message });
    }
});

// Get menu items by category
router.get('/category/:category', cacheMiddleware('menu:category'), async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ category: req.params.category })
            .populate('createdBy', 'name email')
            .select('-__v');
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items by category', error: error.message });
    }
});

module.exports = router;
