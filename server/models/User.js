const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    stallName: {
        type: String,
        required: function () { return this.role === 'admin'; }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
