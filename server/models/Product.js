const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String, // e.g., 'Meals', 'Drinks', 'Snacks'
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String, // URL or path to image
        default: ''
    },
    isOutOfStock: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewsCount: {
        type: Number,
        default: 0
    },
    stallName: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
