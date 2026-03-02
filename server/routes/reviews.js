const express = require('express');
const Review = require('../models/Review');
const router = express.Router();

// Submit a new review
router.post('/', async (req, res) => {
    try {
        const { userId, productId, rating, comment, stallName } = req.body;

        const newReview = new Review({
            user: userId,
            product: productId || null, // null implies general feedback
            rating,
            comment,
            stallName
        });

        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (err) {
        console.error('Submit review error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch reviews (optionally filter by product)
router.get('/', async (req, res) => {
    try {
        const { productId } = req.query;
        let filter = {};
        if (productId) {
            filter.product = productId;
        }

        const reviews = await Review.find(filter)
            .populate('user', 'name')
            .populate('product', 'name image')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (err) {
        console.error('Fetch reviews error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
