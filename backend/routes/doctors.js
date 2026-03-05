const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { successResponse, errorResponse } = require('../utils/response');
const doctorController = require('../controllers/doctorController');

const adminAuth = require('../middleware/adminAuth');

router.post('/', adminAuth, doctorController.createDoctor);

router.get('/', async (req, res) => {
  try {
    const { specialty, hospitalId, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (specialty) filter.specialization = specialty;
    if (hospitalId) filter.hospitalId = hospitalId;
    const doctors = await Doctor.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(successResponse(doctors));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to list doctors'));
  }
});

router.get('/specialty/:specialization', async (req, res) => {
  try {
    const doctors = await Doctor.find({ specialization: req.params.specialization }).limit(50);
    res.json(successResponse(doctors));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to query doctors'));
  }
});

router.get('/hospital/:hospitalId', async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospitalId: req.params.hospitalId });
    res.json(successResponse(doctors));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to query doctors by hospital'));
  }
});

router.get('/:id', doctorController.getDoctorById);

module.exports = router;
