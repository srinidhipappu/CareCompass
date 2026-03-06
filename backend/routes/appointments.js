const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { successResponse, errorResponse } = require('../utils/response');

// Create appointment
router.post('/', async (req, res) => {
  try {
    const { userId, doctorId, hospitalId, appointmentDate, symptoms, urgency } = req.body;
    if (!userId || !doctorId || !appointmentDate) return res.status(400).json(errorResponse('Missing fields'));

    const apptDate = new Date(appointmentDate);
    const conflict = await Appointment.findOne({ doctorId, appointmentDate: apptDate });
    if (conflict) return res.status(400).json(errorResponse('Doctor not available at this time'));

    const appointment = await Appointment.create({
      userId, doctorId, hospitalId, appointmentDate: apptDate, symptoms,
      urgency: urgency || 'Normal',
    });
    const doctor = await Doctor.findById(doctorId).select('name');
    const dateStr = apptDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    res.json(successResponse({
      appointmentId: appointment._id,
      doctor: doctor ? doctor.name : 'Unknown',
      date: dateStr,
      status: appointment.status,
    }, 'Appointment created'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to create appointment'));
  }
});

// Get appointments for a user (with doctor + hospital names populated)
router.get('/user/:userId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId })
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name location')
      .sort({ appointmentDate: -1 });
    res.json(successResponse(appointments));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to get appointments'));
  }
});

// Get single appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name location contact');
    if (!appt) return res.status(404).json(errorResponse('Appointment not found'));
    res.json(successResponse(appt));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to get appointment'));
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
