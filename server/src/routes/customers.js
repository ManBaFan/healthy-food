const express = require('express');
const router = express.Router();

// Mock customers data store (replace with database in production)
let customers = [];

// Get all customers
router.get('/', async (req, res) => {
    try {
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers' });
    }
});

// Create new customer
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, address, preferences } = req.body;

        const newCustomer = {
            id: customers.length + 1,
            name,
            email,
            phone,
            address,
            preferences: preferences || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        customers.push(newCustomer);
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: 'Error creating customer' });
    }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = customers.find(c => c.id === parseInt(req.params.id));
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer' });
    }
});

// Update customer
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, address, preferences } = req.body;
        const customerIndex = customers.findIndex(c => c.id === parseInt(req.params.id));
        
        if (customerIndex === -1) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        customers[customerIndex] = {
            ...customers[customerIndex],
            name: name || customers[customerIndex].name,
            email: email || customers[customerIndex].email,
            phone: phone || customers[customerIndex].phone,
            address: address || customers[customerIndex].address,
            preferences: preferences || customers[customerIndex].preferences,
            updatedAt: new Date()
        };

        res.json(customers[customerIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer' });
    }
});

// Delete customer
router.delete('/:id', async (req, res) => {
    try {
        const customerIndex = customers.findIndex(c => c.id === parseInt(req.params.id));
        
        if (customerIndex === -1) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        customers.splice(customerIndex, 1);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer' });
    }
});

// Update customer preferences
router.patch('/:id/preferences', async (req, res) => {
    try {
        const { preferences } = req.body;
        const customerIndex = customers.findIndex(c => c.id === parseInt(req.params.id));
        
        if (customerIndex === -1) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        customers[customerIndex].preferences = {
            ...customers[customerIndex].preferences,
            ...preferences
        };
        customers[customerIndex].updatedAt = new Date();

        res.json(customers[customerIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer preferences' });
    }
});

module.exports = router;
