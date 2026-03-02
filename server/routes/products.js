const express = require('express');
const Product = require('../models/Product');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all products (for students & admin)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.stall) {
            filter.stallName = req.query.stall;
        }
        const products = await Product.find(filter);
        res.json(products);
    } catch (err) {
        console.error('Fetch products error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a product (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, category, price, image, isOutOfStock } = req.body;

        const newProduct = new Product({
            name,
            category,
            price,
            image,
            isOutOfStock: isOutOfStock !== undefined ? isOutOfStock : false,
            stallName: req.user.stallName
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a product (Admin only - e.g., toggle out of stock)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, category, price, image, isOutOfStock } = req.body;

        // Find and update, ensuring admin owns context
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, stallName: req.user.stallName },
            { name, category, price, image, isOutOfStock },
            { new: true } // Return updated document
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a product (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, stallName: req.user.stallName });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
