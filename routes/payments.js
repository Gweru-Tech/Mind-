const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Business = require('../models/Business');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'Gwerutechnology@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

// Submit payment
router.post('/submit', auth, [
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('transactionId').notEmpty().withMessage('Transaction ID is required'),
    body('paymentMethod').isIn(['ecocash', 'onemoney', 'telecash', 'bank_transfer']).withMessage('Invalid payment method')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phoneNumber, transactionId, paymentMethod, notes } = req.body;

        // Check if payment already exists
        const existingPayment = await Payment.findOne({ transactionId });
        if (existingPayment) {
            return res.status(400).json({ error: 'Transaction ID already used' });
        }

        // Create payment record
        const payment = new Payment({
            businessId: req.businessId,
            phoneNumber,
            transactionId,
            paymentMethod,
            notes
        });

        await payment.save();

        // Get business details
        const business = await Business.findById(req.businessId);

        // Send notification email to admin
        const mailOptions = {
            from: 'Gwerutechnology@gmail.com',
            to: 'Gwerutechnology@gmail.com',
            subject: 'New Payment Submission - Gweru Technologies',
            html: `
                <h2>New Payment Submission</h2>
                <p><strong>Business:</strong> ${business.businessName}</p>
                <p><strong>Owner:</strong> ${business.ownerName}</p>
                <p><strong>Email:</strong> ${business.email}</p>
                <p><strong>Phone:</strong> ${phoneNumber}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Amount:</strong> $2 USD</p>
                <p><strong>Notes:</strong> ${notes || 'None'}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                
                <p>Please verify this payment and activate the business account.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Payment submitted successfully. We will verify and activate your account within 24 hours.',
            paymentId: payment._id
        });

    } catch (error) {
        console.error('Payment submission error:', error);
        res.status(500).json({ error: 'Server error during payment submission' });
    }
});

// Get payment status
router.get('/status', auth, async (req, res) => {
    try {
        const payment = await Payment.findOne({ businessId: req.businessId }).sort({ createdAt: -1 });
        const business = await Business.findById(req.businessId);

        res.json({
            payment: payment || null,
            business: {
                paymentStatus: business.paymentStatus,
                isActive: business.isActive,
                subscriptionExpiry: business.subscriptionExpiry
            }
        });

    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Verify payment
router.post('/verify/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status, notes } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        payment.status = status;
        payment.notes = notes;
        payment.verifiedBy = 'Admin';
        payment.verificationDate = new Date();
        await payment.save();

        // Update business status
        const business = await Business.findById(payment.businessId);
        if (status === 'verified') {
            business.paymentStatus = 'verified';
            business.isActive = true;
            business.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        } else {
            business.paymentStatus = 'pending';
            business.isActive = false;
        }
        await business.save();

        // Send confirmation email
        const mailOptions = {
            from: 'Gwerutechnology@gmail.com',
            to: business.email,
            subject: `Payment ${status === 'verified' ? 'Verified' : 'Rejected'} - Gweru Technologies`,
            html: `
                <h2>Payment ${status === 'verified' ? 'Verified' : 'Rejected'}</h2>
                <p>Dear ${business.ownerName},</p>
                ${status === 'verified' ? 
                    `<p>Your payment has been verified and your account is now active! You can now start advertising your products on our platform.</p>
                     <p><strong>Subscription expires:</strong> ${business.subscriptionExpiry.toDateString()}</p>` :
                    `<p>Unfortunately, we could not verify your payment. Please contact us for assistance.</p>`
                }
                <p><strong>Notes:</strong> ${notes || 'None'}</p>
                <p>Best regards,<br>Gweru Technologies Team</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: `Payment ${status} successfully`
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
});

module.exports = router;
