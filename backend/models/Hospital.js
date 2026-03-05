const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  specializations: [{ type: String }],
  contact: { type: String },
  rating: { type: Number, default: 0 },
  availableDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
});

HospitalSchema.index({ specializations: 1 });

module.exports = mongoose.model('Hospital', HospitalSchema);
