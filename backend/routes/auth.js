const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
// Sync Google Firebase User with MongoDB. If they don't exist, create them.
router.post('/login', async (req, res) => {
    try {
        const { uid, email, displayName, photoURL } = req.body;
        if (!uid || !email) {
            return res.status(400).json({ error: 'Missing uid or email' });
        }

        let user = await User.findOne({ uid });
        
        if (!user) {
            // New user registration
            user = new User({
                uid,
                email,
                displayName: displayName || '',
                photoURL: photoURL || '',
                hasCompletedOnboarding: false
            });
            await user.save();
            return res.status(201).json({ user, isNewUser: true });
        }

        // Returning user
        return res.status(200).json({ user, isNewUser: false });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
