const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    businessType: {
        type: String,
        required: true,
        enum: ['retail', 'wholesale', 'service', 'manufacturing', 'technology', 'food', 'fashion', 'other']
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: 'Zimbabwe'
    },
    website: {
        type: String
    },
    logo: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'verified', 'expired'],
        default: 'pending'
    },
    paymentReference: {
        type: String
    },
    subscriptionExpiry: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

businessSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Business', businessSchema);
