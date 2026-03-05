require('dotenv').config();
const connectDB = require('../config/db');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const hospitalsSeed = [
  {
    name: 'City General Hospital',
    location: 'New York',
    specializations: ['Cardiology', 'Neurology', 'Orthopedics'],
    rating: 4.6,
    contact: '212-555-1010',
  },
  {
    name: 'Green Valley Medical Center',
    location: 'New York',
    specializations: ['Dermatology', 'General Medicine'],
    rating: 4.3,
    contact: '212-555-2020',
  },
  {
    name: 'Sunrise Heart Institute',
    location: 'New York',
    specializations: ['Cardiology'],
    rating: 4.8,
    contact: '212-555-3030',
  },
];

const runSeed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({ email: /@carecompass.test$/ });

    console.log('Inserting hospitals...');
    const createdHospitals = await Hospital.insertMany(hospitalsSeed);

    console.log('Inserting sample doctors...');
    const doctors = [];
    createdHospitals.forEach((h, idx) => {
      doctors.push({
        name: `Dr. Alice ${idx + 1}`,
        specialization: h.specializations[0] || 'General Medicine',
        hospitalId: h._id,
        experienceYears: 8 + idx,
        rating: 4.5 - idx * 0.1,
      });
      doctors.push({
        name: `Dr. Bob ${idx + 1}`,
        specialization: h.specializations[0] || 'General Medicine',
        hospitalId: h._id,
        experienceYears: 5 + idx,
        rating: 4.2 - idx * 0.05,
      });
    });
    const createdDoctors = await Doctor.insertMany(doctors);

    console.log('Creating demo user...');
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const pw = await bcrypt.hash('password', saltRounds);
    const demoUser = await User.create({ name: 'Demo User', email: 'demo@carecompass.test', passwordHash: pw });

    console.log('Seed complete:');
    console.log(`  Hospitals: ${createdHospitals.length}`);
    console.log(`  Doctors: ${createdDoctors.length}`);
    console.log(`  Demo user: ${demoUser.email}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed', err);
    throw err;
  }
};

module.exports = { runSeed };

// If run directly from CLI, execute and exit.
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
