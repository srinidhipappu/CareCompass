const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String },
  hospital: { type: String },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  availability: { type: String, default: 'Available' },
  experienceYears: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  location: { type: String },
});

DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ specialization: 1, rating: -1 });

module.exports = mongoose.model('Doctor', DoctorSchema);
