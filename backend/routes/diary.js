const express = require('express');
const router = express.Router();
const DiaryLog = require('../models/DiaryLog');

// POST /api/diary/log
router.post('/log', async (req, res) => {
    try {
        const { userUid, dateStr, foodItems, totalCalories, totalProtein } = req.body;
        if (!userUid || !dateStr || !foodItems || !foodItems.length) {
            return res.status(400).json({ error: 'Missing required tracking fields' });
        }

        let log = await DiaryLog.findOne({ userUid: userUid, dateStr: dateStr });

        if (log) {
            log.foodItems.push(...foodItems);
            log.totalCalories += (totalCalories || 0);
            log.totalProtein += (totalProtein || 0);
            await log.save();
        } else {
            log = new DiaryLog({
                userUid,
                dateStr,
                foodItems,
                totalCalories: totalCalories || 0,
                totalProtein: totalProtein || 0
            });
            await log.save();
        }

        res.status(200).json({ log, message: 'Saved successfully' });
    } catch (err) {
        console.error('Diary Log Error:', err);
        res.status(500).json({ error: 'Server diary save error' });
    }
});

// GET /api/diary/history/:uid
router.get('/history/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const logs = await DiaryLog.find({ userUid: uid }).sort({ dateStr: -1 });
        res.json({ logs });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching diary history' });
    }
});

// DELETE /api/diary/today/:uid
// Completely wipes the progress for the current day
router.delete('/today/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const todayStr = new Date().toISOString().split('T')[0];
        await DiaryLog.findOneAndDelete({ userUid: uid, dateStr: todayStr });
        res.json({ message: "Today's logs reset successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to reset today's logs" });
    }
});

// DELETE /api/diary/log/:id
// Completely deletes a specific chronological log safely
router.delete('/log/:id', async (req, res) => {
    try {
        await DiaryLog.findByIdAndDelete(req.params.id);
        res.json({ message: "Log deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete log entry" });
    }
});

module.exports = router;
