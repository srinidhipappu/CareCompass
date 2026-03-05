const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { successResponse, errorResponse } = require('../utils/response');

// Create appointment
router.post('/', async (req, res) => {
  try {
    const { userId, doctorId, hospitalId, appointmentDate, symptoms } = req.body;
    if (!userId || !doctorId || !appointmentDate) return res.status(400).json(errorResponse('Missing fields'));

    const apptDate = new Date(appointmentDate);
    const conflict = await Appointment.findOne({ doctorId, appointmentDate: apptDate });
    if (conflict) return res.status(400).json(errorResponse('Doctor not available at this time'));

    const appointment = await Appointment.create({ userId, doctorId, hospitalId, appointmentDate: apptDate, symptoms });
    res.json(successResponse(appointment, 'Appointment created'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to create appointment'));
  }
});

// Get appointments for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId });
    res.json(successResponse(appointments));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to get appointments'));
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt) return res.status(404).json(errorResponse('Appointment not found'));
    res.json(successResponse(appt, 'Appointment deleted'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to delete appointment'));
  }
});

module.exports = router;
