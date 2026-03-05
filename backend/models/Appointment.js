const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  appointmentDate: { type: Date, required: true },
  symptoms: { type: String },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

AppointmentSchema.index({ userId: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
