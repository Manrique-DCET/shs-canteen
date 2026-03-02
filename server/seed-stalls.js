require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const stalls = [
    "Burger and Footlong Bites",
    "Chicking Eat",
    "Fresh Fruit Shake",
    "Fried Noodles",
    "Ganza Au",
    "Loveshot Coffee & Pastries",
    "Potato Roll",
    "Silog Meals",
    "Takoyaki",
    "Tender Juicy",
    "Waffle Time"
];

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Dropping existing Products and Orders to ensure clean schema...');
        await Product.deleteMany({});
        await Order.deleteMany({});

        console.log('Removing old admins...');
        await User.deleteMany({ role: 'admin' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        console.log('Creating new stall admins...');

        for (const stall of stalls) {
            // e.g. "takoyaki@admin.com", "waffle-time@admin.com"
            const emailPrefix = stall.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const email = `${emailPrefix}@admin.com`;

            const newAdmin = new User({
                email,
                password: hashedPassword,
                name: `${stall} Admin`,
                role: 'admin',
                stallName: stall
            });
            await newAdmin.save();
            console.log(`Created admin: ${email} | Password: admin123 | Stall: ${stall}`);
        }

        console.log('Creation successful!');
        process.exit(0);
    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    }
}

seedDatabase();
