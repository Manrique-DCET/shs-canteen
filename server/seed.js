const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const products = [
    {
        name: "Classic Cheeseburger",
        category: "Meals",
        price: 85.00,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
        inStock: true
    },
    {
        name: "Fried Chicken w/ Rice",
        category: "Meals",
        price: 95.00,
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=500&q=80",
        inStock: true
    },
    {
        name: "Pork Siomai (4pcs)",
        category: "Snacks",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=500&q=80",
        inStock: true
    },
    {
        name: "French Fries",
        category: "Snacks",
        price: 55.00,
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80",
        inStock: true
    },
    {
        name: "Iced Tea",
        category: "Drinks",
        price: 25.00,
        image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=500&q=80",
        inStock: true
    },
    {
        name: "Lemon Juice",
        category: "Drinks",
        price: 35.00,
        image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=500&q=80",
        inStock: true
    },
    {
        name: "Chocolate Waffle",
        category: "Snacks",
        price: 60.00,
        image: "https://images.unsplash.com/photo-1562376552-0d160a2f14b5?auto=format&fit=crop&w=500&q=80",
        inStock: false // Out of stock example
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log('Database Seeded Successfully!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
