require('dotenv').config();
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Doctor = require('../models/Doctor');

const SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Orthopedics',
  'Pulmonology',
  'Gastroenterology',
  'General Medicine',
];

const HOSPITAL_SUFFIXES = [
  'Medical Center',
  'General Hospital',
  'Regional Hospital',
  'Health Institute',
  'Heart Institute',
  'Specialty Clinic',
  'University Hospital',
  'Memorial Hospital',
];

const US_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
  'Indianapolis', 'San Francisco', 'Seattle', 'Denver', 'Nashville',
  'Boston', 'Las Vegas', 'Portland', 'Memphis', 'Atlanta',
];

const AVAILABILITY_OPTIONS = ['Available', 'Unavailable', 'On Leave'];

function generateDoctor() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const hospitalCity = faker.helpers.arrayElement(US_CITIES);
  const hospitalName = `${hospitalCity} ${faker.helpers.arrayElement(HOSPITAL_SUFFIXES)}`;

  return {
    name: `Dr. ${firstName} ${lastName}`,
    specialization: faker.helpers.arrayElement(SPECIALIZATIONS),
    hospital: hospitalName,
    experienceYears: faker.number.int({ min: 1, max: 35 }),
    rating: parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 })),
    availability: faker.helpers.arrayElement(AVAILABILITY_OPTIONS),
    location: faker.helpers.arrayElement(US_CITIES),
  };
}

async function seed() {
  await connectDB();

  console.log('Clearing existing doctors...');
  await Doctor.deleteMany({});

  const doctors = Array.from({ length: 1000 }, generateDoctor);

  console.log('Inserting 1,000 doctors...');
  await Doctor.insertMany(doctors);

  console.log('Seeding complete. 1,000 doctors inserted.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
