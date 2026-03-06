// CLI shim that delegates to services/seedService.js
const { runSeed } = require('../services/seedService');

runSeed()
  .then((res) => {
    console.log('Seed complete:');
    console.log(`  Hospitals: ${res.createdHospitals.length}`);
    console.log(`  Doctors: ${res.createdDoctors.length}`);
    console.log(`  Demo user: ${res.demoUser.email}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed', err);
    process.exit(1);
  });
