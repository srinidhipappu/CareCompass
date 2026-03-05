const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

router.get('/', hospitalController.listHospitals);
router.get('/specialty/:specialization', hospitalController.hospitalsBySpecialty);
router.get('/:id', hospitalController.getHospitalById);

module.exports = router;
