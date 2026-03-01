const express = require('express');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get Sales & Analytics
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        // 1. Calculate Total Revenue (Completed & Ready orders)
        const activeOrCompleted = await Order.find({ status: { $in: ['Ready', 'Completed'] } });
        const totalRevenue = activeOrCompleted.reduce((sum, order) => sum + order.totalAmount, 0);

        // 2. Popular Items
        const allOrders = await Order.find().populate('items.product', 'name');
        const itemCounts = {};

        allOrders.forEach(order => {
            order.items.forEach(item => {
                const prodName = item.product ? item.product.name : 'Unknown Product';
                if (!itemCounts[prodName]) {
                    itemCounts[prodName] = { name: prodName, quantity: 0, revenue: 0 };
                }
                itemCounts[prodName].quantity += item.quantity;
                itemCounts[prodName].revenue += (item.price * item.quantity);
            });
        });

        const popularItems = Object.values(itemCounts)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5); // top 5

        // 3. Average General Rating (Feedback)
        const reviews = await Review.find({ product: null });
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        res.json({
            totalRevenue,
            totalOrders: activeOrCompleted.length,
            popularItems,
            averageGeneralRating: avgRating
        });

    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
