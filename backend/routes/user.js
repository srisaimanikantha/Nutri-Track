const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Calculate BMI and Base Calories (TDEE) based on Goal
function calculateMetrics(age, gender, heightCM, weightKG, goal) {
    const heightM = heightCM / 100;
    const bmi = parseFloat((weightKG / (heightM * heightM)).toFixed(1));
    
    // BMR Calculation using Mifflin-St Jeor Equation
    let bmr = (10 * weightKG) + (6.25 * heightCM) - (5 * age);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;
    
    // Assume moderate activity multiplier 1.55 for TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * 1.55;
    
    // Adjust based on user goal
    let targetCalories = tdee;
    let targetProtein = weightKG * 1.8; // default 1.8g per kg

    if (goal === 'weightloss') {
        targetCalories = tdee - 500; // 500 calorie deficit
        targetProtein = weightKG * 2.0; // Higher protein to preserve muscle
    } else if (goal === 'bulking') {
        targetCalories = tdee + 500; // 500 calorie surplus
        targetProtein = weightKG * 2.2; // Maximum protein for bulking
    } else {
        targetCalories = tdee; // Recomposition / Maintenance
        targetProtein = weightKG * 2.0;
    }
    
    return { bmi, targetCalories: Math.round(targetCalories), targetProtein: Math.round(targetProtein) };
}

// PUT /api/user/onboard
// Handles the onboarding setup wizard metrics setup
router.put('/onboard', async (req, res) => {
    try {
        const { userId, gender, age, heightCM, weightKG, targetWeightKG, goal } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing UserId' });

        const metrics = calculateMetrics(age, gender, heightCM, weightKG, goal);
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                gender,
                age,
                heightCM,
                weightKG,
                targetWeightKG,
                goal,
                bmi: metrics.bmi,
                targetCalories: metrics.targetCalories,
                targetProtein: metrics.targetProtein,
                hasCompletedOnboarding: true
            },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });
        res.json({ user: updatedUser });
    } catch (err) {
        console.error('Onboard Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/user/:userId
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
