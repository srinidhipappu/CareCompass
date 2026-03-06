const express = require('express');
const router = express.Router();
const Specialization = require('../models/Specialization');
const { successResponse, errorResponse } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const specializations = await Specialization.find().sort({ name: 1 });
    res.json(successResponse(specializations));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to list specializations'));
  }
});

module.exports = router;
