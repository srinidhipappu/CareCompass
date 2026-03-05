const express = require('express');

const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const adminAuth = require('../middleware/adminAuth');

router.post('/', adminAuth, hospitalController.createHospital);
router.get('/', hospitalController.listHospitals);
router.get('/specialty/:specialization', hospitalController.hospitalsBySpecialty);
router.get('/:id', hospitalController.getHospitalById);

module.exports = router;
