const express = require('express');
const Product = require('../models/Product');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all products (for students & admin)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
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
            isOutOfStock: isOutOfStock !== undefined ? isOutOfStock : false
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

        // Find and update
        const product = await Product.findByIdAndUpdate(
            req.params.id,
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
        const product = await Product.findByIdAndDelete(req.params.id);
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
