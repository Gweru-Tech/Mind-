const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'ZWL', 'RTGS']
    },
    category: {
        type: String,
        required: true,
        enum: ['electronics', 'clothing', 'food', 'services', 'automotive', 'home', 'beauty', 'sports', 'books', 'other']
    },
    images: [{
        url: String,
        alt: String
    }],
    specifications: [{
        key: String,
        value: String
    }],
    inStock: {
        type: Boolean,
        default: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    tags: [String],
    featured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
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

productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);
