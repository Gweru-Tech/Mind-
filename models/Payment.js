const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 2
    },
    currency: {
        type: String,
        default: 'USD'
    },
    paymentMethod: {
        type: String,
        enum: ['ecocash', 'onemoney', 'telecash', 'bank_transfer'],
        default: 'ecocash'
    },
    phoneNumber: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifiedBy: {
        type: String
    },
    verificationDate: {
        type: Date
    },
    subscriptionMonths: {
        type: Number,
        default: 1
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', paymentSchema);
