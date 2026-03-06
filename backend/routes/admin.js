const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { runSeed } = require('../services/seedService');
const { successResponse, errorResponse } = require('../utils/response');

router.post('/seed', adminAuth, async (req, res) => {
  try {
    const result = await runSeed();
    res.json(successResponse({ hospitals: result.createdHospitals.length, doctors: result.createdDoctors.length }, 'Seed completed'));
  } catch (err) {
    res.status(500).json(errorResponse('Seed failed'));
  }
});

module.exports = router;
