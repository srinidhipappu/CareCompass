const connectDB = require('../config/db');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Specialization = require('../models/Specialization');
const bcrypt = require('bcrypt');

const specializationsSeed = [
  { name: 'Cardiology', description: 'Diagnosis and treatment of heart and cardiovascular diseases' },
  { name: 'Neurology', description: 'Disorders of the nervous system, brain and spine' },
  { name: 'Orthopedics', description: 'Musculoskeletal system including bones, joints and muscles' },
  { name: 'Dermatology', description: 'Skin, hair and nail conditions' },
  { name: 'General Medicine', description: 'General health conditions and primary care' },
  { name: 'Obstetrics', description: 'Pregnancy, childbirth and the postpartum period' },
  { name: 'Dentistry', description: 'Oral health, teeth and gums' },
  { name: 'Psychiatry', description: 'Mental health disorders and behavioral conditions' },
  { name: 'Ophthalmology', description: 'Eye diseases and vision disorders' },
  { name: 'Gastroenterology', description: 'Digestive system and related organs' },
  { name: 'ENT', description: 'Ear, nose and throat conditions' },
  { name: 'Pediatrics', description: 'Medical care for infants, children and adolescents' },
  { name: 'Urology', description: 'Urinary tract and male reproductive system disorders' },
  { name: 'Endocrinology', description: 'Hormonal and metabolic disorders including diabetes' },
  { name: 'Oncology', description: 'Diagnosis and treatment of cancer' },
];

// locationCoords: [longitude, latitude] — required for $near geospatial queries
const hospitalsSeed = [
  // New York City area
  {
    name: 'City General Hospital',
    location: 'New York, NY',
    zip: '10001',
    specializations: ['Cardiology', 'Neurology', 'Orthopedics'],
    rating: 4.6,
    contact: '212-555-1010',
    locationCoords: { type: 'Point', coordinates: [-74.0060, 40.7128] },
  },
  {
    name: 'Green Valley Medical Center',
    location: 'Brooklyn, NY',
    zip: '11201',
    specializations: ['Dermatology', 'General Medicine', 'Pediatrics'],
    rating: 4.3,
    contact: '718-555-2020',
    locationCoords: { type: 'Point', coordinates: [-73.9857, 40.6928] },
  },
  {
    name: 'Sunrise Heart Institute',
    location: 'Queens, NY',
    zip: '11354',
    specializations: ['Cardiology', 'Endocrinology'],
    rating: 4.8,
    contact: '718-555-3030',
    locationCoords: { type: 'Point', coordinates: [-73.9442, 40.7282] },
  },
  {
    name: 'Manhattan Neurology Center',
    location: 'New York, NY',
    zip: '10016',
    specializations: ['Neurology', 'Psychiatry'],
    rating: 4.5,
    contact: '212-555-4040',
    locationCoords: { type: 'Point', coordinates: [-73.9822, 40.7484] },
  },
  // New Jersey (near zip 08901 — New Brunswick)
  {
    name: 'Robert Wood Johnson University Hospital',
    location: 'New Brunswick, NJ',
    zip: '08901',
    specializations: ['Cardiology', 'Oncology', 'Orthopedics', 'Neurology'],
    rating: 4.7,
    contact: '732-555-5050',
    locationCoords: { type: 'Point', coordinates: [-74.4518, 40.4774] },
  },
  {
    name: 'Jersey Shore Medical Center',
    location: 'Neptune, NJ',
    zip: '07753',
    specializations: ['General Medicine', 'Obstetrics', 'Pediatrics'],
    rating: 4.2,
    contact: '732-555-6060',
    locationCoords: { type: 'Point', coordinates: [-74.0476, 40.2068] },
  },
  // Los Angeles area
  {
    name: 'Cedars-Sinai Medical Center',
    location: 'Los Angeles, CA',
    zip: '90048',
    specializations: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
    rating: 4.9,
    contact: '310-555-7070',
    locationCoords: { type: 'Point', coordinates: [-118.3806, 34.0750] },
  },
  {
    name: 'UCLA Medical Center',
    location: 'Los Angeles, CA',
    zip: '90095',
    specializations: ['General Medicine', 'Psychiatry', 'Dermatology', 'Endocrinology'],
    rating: 4.8,
    contact: '310-555-8080',
    locationCoords: { type: 'Point', coordinates: [-118.4452, 34.0659] },
  },
  // Chicago area
  {
    name: 'Northwestern Memorial Hospital',
    location: 'Chicago, IL',
    zip: '60611',
    specializations: ['Cardiology', 'Neurology', 'Gastroenterology'],
    rating: 4.7,
    contact: '312-555-9090',
    locationCoords: { type: 'Point', coordinates: [-87.6216, 41.8955] },
  },
  {
    name: 'Rush University Medical Center',
    location: 'Chicago, IL',
    zip: '60612',
    specializations: ['Orthopedics', 'Oncology', 'Obstetrics', 'Urology'],
    rating: 4.6,
    contact: '312-555-1001',
    locationCoords: { type: 'Point', coordinates: [-87.6716, 41.8740] },
  },
];

async function runSeed() {
  await connectDB();
  await Hospital.deleteMany({});
  await Doctor.deleteMany({});
  await User.deleteMany({ email: /@carecompass.test$/ });
  await Specialization.deleteMany({});
  await Specialization.insertMany(specializationsSeed);

  const createdHospitals = await Hospital.insertMany(hospitalsSeed);

  // Create one doctor per specialization per hospital (covering all specializations)
  const firstNames = ['James', 'Sarah', 'Michael', 'Emily', 'David', 'Olivia', 'Robert', 'Sophia', 'William', 'Ava', 'John', 'Mia', 'Charles', 'Isabella', 'Thomas'];
  const lastNames  = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
  let nameIdx = 0;
  const doctors = [];
  createdHospitals.forEach((h) => {
    h.specializations.forEach((spec, si) => {
      const fn = firstNames[nameIdx % firstNames.length];
      const ln = lastNames[(nameIdx + 3) % lastNames.length];
      nameIdx++;
      doctors.push({
        name: `Dr. ${fn} ${ln}`,
        specialization: spec,
        hospitalId: h._id,
        experienceYears: 5 + (nameIdx % 20),
        rating: parseFloat((3.8 + (nameIdx % 12) * 0.1).toFixed(1)),
      });
    });
  });
  const createdDoctors = await Doctor.insertMany(doctors);

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
  const pw = await bcrypt.hash('password', saltRounds);
  const demoUser = await User.create({ name: 'Demo User', email: 'demo@carecompass.test', passwordHash: pw });

  return { createdHospitals, createdDoctors, demoUser };
}

module.exports = { runSeed };
