const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    senderType: {
        type: String,
        enum: ['business', 'admin'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    attachments: [{
        url: String,
        type: String,
        name: String
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema);
