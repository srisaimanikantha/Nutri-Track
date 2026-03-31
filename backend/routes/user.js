const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Calculate BMR, TDEE, and Macros
function calculateMetrics(age, gender, heightCM, weightKG, goal, activityLevel = 'sedentary') {
    const heightM = heightCM / 100;
    const bmi = parseFloat((weightKG / (heightM * heightM)).toFixed(1));
    
    // Step 2: Calculate BMR using Mifflin-St Jeor Equation
    let bmr = (10 * weightKG) + (6.25 * heightCM) - (5 * age);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;
    
    // Step 3: Calculate TDEE based on activity level
    const activityMultipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'very': 1.725,
        'super': 1.9
    };
    const activityFactor = activityMultipliers[activityLevel] || 1.2;
    const tdee = bmr * activityFactor;
    
    // Step 4: Adjust calories based on goal
    let targetCalories = tdee;
    if (goal === 'weightloss' || goal === 'fatloss') {
        targetCalories = tdee - 500;
    } else if (goal === 'bulking' || goal === 'musclegain' || goal === 'weightgain') {
        targetCalories = tdee + 400; // Average of 300 to 500
    }

    // Step 5: Calculate Protein Intake
    let proteinRatio = 0.8; // Default sedentary
    if (activityLevel === 'light') proteinRatio = 1.0;
    else if (activityLevel === 'moderate') proteinRatio = 1.35; // 1.2-1.5 range
    else if (activityLevel === 'very' || activityLevel === 'super') proteinRatio = 1.8; // 1.6-2.0 range

    // Goal specific protein overlaps
    if (goal === 'weightloss' || goal === 'fatloss') {
        proteinRatio = Math.max(proteinRatio, 1.9); // 1.6-2.2 range
    } else if (goal === 'bulking' || goal === 'musclegain' || goal === 'weightgain') {
        proteinRatio = Math.max(proteinRatio, 2.0); // 1.8-2.2 range
    }

    const targetProtein = weightKG * proteinRatio;
    
    return { 
        bmi, 
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories), 
        targetProtein: Math.round(targetProtein) 
    };
}

// PUT /api/user/onboard
// Handles the onboarding setup wizard metrics setup
router.put('/onboard', async (req, res) => {
    try {
        const { userId, gender, age, heightCM, weightKG, targetWeightKG, goal, activityLevel } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing UserId' });

        const metrics = calculateMetrics(age, gender, heightCM, weightKG, goal, activityLevel);
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                gender,
                age,
                heightCM,
                weightKG,
                targetWeightKG,
                goal,
                activityLevel,
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
