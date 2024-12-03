const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Mock user data store (replace with database in production)
let users = [];

// Get all users (admin only)
router.get('/', async (req, res) => {
    try {
        // In production, you would fetch from database
        res.json(users.map(u => ({ id: u.id, email: u.email, createdAt: u.createdAt })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        if (users.some(u => u.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        users.push(newUser);

        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            createdAt: newUser.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = users.find(u => u.id === parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user' });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
        
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user data
        if (email) users[userIndex].email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            users[userIndex].password = await bcrypt.hash(password, salt);
        }

        res.json({
            id: users[userIndex].id,
            email: users[userIndex].email,
            createdAt: users[userIndex].createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
        
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        users.splice(userIndex, 1);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
