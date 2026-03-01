const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendFoodReadyEmail } = require('../utils/email');

const router = express.Router();

// Create a new order (Student)
router.post('/', async (req, res) => {
    try {
        const { userId, items, totalAmount } = req.body;

        // items should be [{ product: productId, quantity: Number, price: Number }]
        const newOrder = new Order({
            user: userId,
            items,
            totalAmount
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get orders (If admin: get all, If student: get their own)
router.get('/', async (req, res) => {
    try {
        const { userId, role } = req.query; // in real app, get from typical jwt auth middleware

        let orders;
        if (role === 'admin') {
            // Admin sees active orders, optionally sort by newest
            // Populate user info to show student name
            orders = await Order.find().populate('user', 'name email').populate('items.product', 'name image').sort({ createdAt: -1 });
        } else {
            // Student sees their own orders
            orders = await Order.find({ user: userId }).populate('items.product', 'name image');
        }

        res.json(orders);
    } catch (err) {
        console.error('Fetch orders error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update order status (Admin only)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Trigger email notification if status changes to 'Ready'
        if (status === 'Ready' && order.user && order.user.email) {
            await sendFoodReadyEmail(order.user.email, order._id, order.user.name);
        }

        res.json(order);
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
