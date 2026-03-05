const Doctor = require('../models/Doctor');
const { successResponse, errorResponse } = require('../utils/response');

exports.createDoctor = async (req, res) => {
  try {
    const { name, specialization, hospitalId, availability, experienceYears, rating } = req.body;
    if (!name || !specialization) return res.status(400).json(errorResponse('Missing required fields'));
    const doctor = await Doctor.create({ name, specialization, hospitalId, availability, experienceYears, rating });
    res.status(201).json(successResponse(doctor, 'Doctor created'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to create doctor'));
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json(errorResponse('Doctor not found'));
    res.json(successResponse(doctor));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to get doctor'));
  }
};
