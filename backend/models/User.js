const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true },
    displayName: { type: String },
    photoURL: { type: String },
    
    // Onboarding Data
    hasCompletedOnboarding: { type: Boolean, default: false },
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    age: { type: Number, default: 25 },
    heightCM: { type: Number, default: 170 },
    weightKG: { type: Number, default: 70 },
    targetWeightKG: { type: Number },
    goal: { type: String, enum: ['weightloss', 'recomposition', 'bulking'], default: 'recomposition' },
    
    // Automatically Calculated from BMI/Goal logic during Onboarding
    bmi: { type: Number },
    targetCalories: { type: Number, default: 2000 },
    targetProtein: { type: Number, default: 120 } // In grams
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
