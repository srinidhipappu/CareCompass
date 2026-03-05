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

    // find hospitals matching specialization
    const hospitals = await Hospital.find({ specializations: predictedSpecialization }).limit(20);

    // simple ranking: rating desc
    hospitals.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const recommended = hospitals.slice(0, 5);

    // save query
    await SymptomQuery.create({ userId, symptomsText, predictedSpecialization, confidence, urgency });

    res.json(successResponse({ predictedSpecialization, confidence, urgency, recommended }));
  } catch (err) {
    res.status(500).json(errorResponse('AI analysis failed'));
  }
};
