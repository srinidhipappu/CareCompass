const mongoose = require('mongoose');

const SymptomQuerySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  symptomsText: { type: String, required: true },
  predictedSpecialization: { type: String },
  confidence: { type: Number, default: 0 },
  urgency: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SymptomQuery', SymptomQuerySchema);
