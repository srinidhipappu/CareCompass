const Hospital = require('../models/Hospital');
const { successResponse, errorResponse } = require('../utils/response');

exports.listHospitals = async (req, res) => {
  try {
    const { specialization, location, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (specialization) filter.specializations = specialization;
    if (location) filter.location = new RegExp(location, 'i');

    const hospitals = await Hospital.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(successResponse(hospitals));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to list hospitals'));
  }
};

exports.hospitalsBySpecialty = async (req, res) => {
  try {
    const { specialization } = req.params;
    const hospitals = await Hospital.find({ specializations: specialization }).limit(50);
    res.json(successResponse(hospitals));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to query hospitals by specialty'));
  }
};

exports.createHospital = async (req, res) => {
  try {
    const { name, location, specializations, contact, rating } = req.body;
    if (!name) return res.status(400).json(errorResponse('Name is required'));
    const hospital = await Hospital.create({ name, location, specializations, contact, rating });
    res.status(201).json(successResponse(hospital, 'Hospital created'));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to create hospital'));
  }
};

exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json(errorResponse('Hospital not found'));
    res.json(successResponse(hospital));
  } catch (err) {
    res.status(500).json(errorResponse('Failed to get hospital'));
  }
};
