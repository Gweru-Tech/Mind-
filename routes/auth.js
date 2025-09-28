const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Business = require('../models/Business');
const router = express.Router();

// Register business
router.post('/register', [
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('ownerName').notEmpty().withMessage('Owner name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('businessType').notEmpty().withMessage('Business type is required'),
    body('description').notEmpty().withMessage('Business description is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            businessName,
            ownerName,
            email,
            phone,
            password,
            businessType,
            description,
            address,
            city,
            website
        } = req.body;

        // Check if business already exists
        const existingBusiness = await Business.findOne({ email });
        if (existingBusiness) {
            return res.status(400).json({ error: 'Business with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new business
        const business = new Business({
            businessName,
            ownerName,
            email,
            phone,
            password: hashedPassword,
            businessType,
            description,
            address,
            city,
            website
        });

        await business.save();

        res.status(201).json({
            success: true,
            message: 'Business registered successfully. Please make payment to activate your account.',
            businessId: business._id
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login business
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find business
        const business = await Business.findOne({ email });
        if (!business) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, business.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { businessId: business._id },
            process.env.JWT_SECRET || 'gweru-tech-secret',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            business: {
                id: business._id,
                businessName: business.businessName,
                email: business.email,
                paymentStatus: business.paymentStatus,
                isActive: business.isActive
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

module.exports = router;
