const express = require('express');
const router = express.Router();
const db = require('../db/db');
const authMiddleware = require('../middleware/authMiddleware');

// GET /profile - ดูโปรไฟล์ตัวเอง
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT display_name, bio, avatar_url, updated_at FROM user_profiles WHERE user_id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.json({ display_name: req.user.username, bio: null, avatar_url: null });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /profile - อัปเดตโปรไฟล์
router.put('/profile', authMiddleware, async (req, res) => {
    const { display_name, bio, avatar_url } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO user_profiles (user_id, display_name, bio, avatar_url)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id) 
             DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url, updated_at = NOW()
             RETURNING *`,
            [req.user.id, display_name, bio, avatar_url]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;