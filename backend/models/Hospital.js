const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  zip: { type: String },
  // GeoJSON point for geospatial queries: [longitude, latitude]
  locationCoords: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  specializations: [{ type: String }],
  contact: { type: String },
  rating: { type: Number, default: 0 },
  availableDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
});

HospitalSchema.index({ specializations: 1 });
HospitalSchema.index({ locationCoords: '2dsphere' });

module.exports = mongoose.model('Hospital', HospitalSchema);
