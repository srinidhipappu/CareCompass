const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, index: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  availability: [{ start: Date, end: Date }],
  experienceYears: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
});

DoctorSchema.index({ specialization: 1 });

module.exports = mongoose.model('Doctor', DoctorSchema);
