require('dotenv').config();
const connectDB = require('../config/db');
const Hospital = require('../models/Hospital');
const zipcodes = require('zipcodes');

const run = async () => {
  try {
    await connectDB();
    console.log('Starting hospital coordinates population...');

    const hospitals = await Hospital.find({ zip: { $exists: true, $ne: null } });
    let updated = 0;

    for (const h of hospitals) {
      try {
        if (h.locationCoords && Array.isArray(h.locationCoords.coordinates) && h.locationCoords.coordinates[0] !== 0) {
          continue; // already has coordinates
        }

        const zip = (h.zip || '').toString().trim();
        if (!zip) continue;

        const loc = zipcodes.lookup(zip);
        if (!loc || !loc.latitude || !loc.longitude) {
          console.warn(`No coords for zip ${zip} (hospital ${h._id})`);
          continue;
        }

        const lat = parseFloat(loc.latitude);
        const lng = parseFloat(loc.longitude);
        h.locationCoords = { type: 'Point', coordinates: [lng, lat] };
        await h.save();
        updated++;
        console.log(`Updated hospital ${h._id} with coords ${lat},${lng}`);
      } catch (err) {
        console.error('Failed to update hospital', h._id, err.message || err);
      }
    }

    console.log(`Done. Updated ${updated} hospitals.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

run();
