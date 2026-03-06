const aiService = require('../services/aiService');
const Hospital = require('../models/Hospital');
const SymptomQuery = require('../models/SymptomQuery');
const { successResponse, errorResponse } = require('../utils/response');

exports.analyze = async (req, res) => {
  try {
    const { userId, symptomsText } = req.body;
    if (!symptomsText) return res.status(400).json(errorResponse('Missing symptomsText'));

    const prediction = await aiService.analyzeSymptoms(symptomsText);
    const { predictedSpecialization, confidence, urgency } = prediction;

    // find hospitals matching specialization, sorted by proximity to New Brunswick NJ then by rating
    const { lat = 40.4774, lng = -74.4518 } = req.body; // default: New Brunswick, NJ
    let recommended = [];
    try {
      recommended = await Hospital.find({
        specializations: predictedSpecialization,
        locationCoords: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: 500000, // 500 km
          },
        },
      }).limit(5);
    } catch {
      // fallback if geospatial index not available
      const hospitals = await Hospital.find({ specializations: predictedSpecialization }).limit(20);
      hospitals.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      recommended = hospitals.slice(0, 5);
    }

    // save query
    await SymptomQuery.create({ userId, symptomsText, predictedSpecialization, confidence, urgency });

    res.json(successResponse({ predictedSpecialization, confidence, urgency, recommended }));
  } catch (err) {
    // If NLP model not installed, return 501 to signal missing optional dependency
    if (err && /NLP model not installed/.test(String(err.message))) {
      return res.status(501).json(errorResponse('NLP model not installed on server'));
    }
    console.error('AI analyze error:', err);
    res.status(500).json(errorResponse('AI analysis failed'));
  }
};
