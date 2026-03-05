const express = require('express');
const router = express.Router();
const { runSeed } = require('../utils/seed');
const adminAuth = require('../middleware/adminAuth');

// Protected seed endpoint: POST /api/admin/seed
router.post('/seed', adminAuth, async (req, res) => {
  try {
    await runSeed();
    res.json({ success: true, message: 'Seed executed' });
  } catch (err) {
    console.error('Seed failed via API', err);
    res.status(500).json({ success: false, error: 'Seed failed' });
  }
});

module.exports = router;
