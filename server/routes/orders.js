const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendFoodReadyEmail } = require('../utils/email');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Create a new order (Student)
router.post('/', async (req, res) => {
    try {
        const { userId, items, totalAmount } = req.body;

        // Basic Validation
        if (!userId || !items || items.length === 0 || !totalAmount) {
            return res.status(400).json({ message: 'Missing required order details' });
        }

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
        res.status(500).json({ message: 'Server error processing order' });
    }
});

// Get orders
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        // Admin sees active orders, optionally sort by newest
        // Populate user info to show student name
        const orders = await Order.find().populate('user', 'name email').populate('items.product', 'name image').sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error('Fetch orders error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update order status (Admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
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
        if (status === 'Ready') {
            console.log(`Order ${req.params.id} marked as Ready. Checking for student email...`);
            if (order.user && order.user.email) {
                console.log(`Sending email to ${order.user.email}...`);
                await sendFoodReadyEmail(order.user.email, order._id, order.user.name);
            } else {
                console.warn(`Could not send email for order ${order._id}: User or email missing.`, order.user);
            }
        }

        res.json(order);
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
