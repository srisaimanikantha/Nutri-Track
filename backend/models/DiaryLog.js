const mongoose = require('mongoose');

const DiaryLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateStr: { type: String, required: true },
    totalCalories: { type: Number, required: true, default: 0 },
    totalProtein: { type: Number, required: true, default: 0 },
    foodItems: [{
        name: { type: String },
        quantity: { type: String },
        calories: { type: Number },
        protein: { type: Number }, // in grams
        confidence: { type: Number },
        mealType: { type: String, default: 'lunch' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('DiaryLog', DiaryLogSchema);
