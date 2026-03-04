const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendFoodReadyEmail } = require('../utils/email');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Create a new order (Student)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { userId, items, totalAmount, stallName } = req.body;

        // Basic Validation
        if (!userId || !items || items.length === 0 || !totalAmount || !stallName) {
            return res.status(400).json({ message: 'Missing required order details' });
        }

        // Validate the authenticated user matches the userId in the body
        if (req.user.id !== userId) {
            return res.status(403).json({ message: 'Unauthorized order placement' });
        }

        // items should be [{ product: productId, quantity: Number, price: Number }]
        const newOrder = new Order({
            user: userId,
            items,
            totalAmount,
            stallName
        });

        const savedOrder = await newOrder.save();

        // Emit newOrder event to the specific stall's room
        const io = req.app.get('io');
        if (io) {
            // Populate the user before sending to mimic the existing payload
            await savedOrder.populate('user', 'name email');
            await savedOrder.populate('items.product', 'name image');
            io.to(`stall_${stallName}`).emit('newOrder', savedOrder);
        }

        res.status(201).json(savedOrder);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ message: 'Server error processing order' });
    }
});

// Get orders
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        // Admin sees active orders for their stall, optionally sort by newest
        // Populate user info to show student name
        const orders = await Order.find({ stallName: req.user.stallName })
            .populate('user', 'name email')
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 });

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

        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, stallName: req.user.stallName },
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

        // Emit orderStatusChanged event via WebSockets
        const io = req.app.get('io');
        if (io && order.user) {
            // Emitting to the specific student's room
            io.to(`student_${order.user._id}`).emit('orderStatusChanged', {
                orderId: order._id,
                status: status,
                stallName: order.stallName
            });
        }

        res.json(order);
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
