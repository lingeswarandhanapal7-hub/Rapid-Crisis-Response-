const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPatients, getPatient, createPatient,
  assignDoctor, assignNurse, updateVitals,
  getAuditLogs, getStats,
} = require('../controllers/patientController');

router.get('/stats', protect, authorize('chief_doctor', 'doctor'), getStats);
router.get('/', protect, getPatients);
router.post('/', protect, authorize('chief_doctor'), createPatient);
router.get('/:id', protect, getPatient);
router.patch('/:id/assign-doctor', protect, authorize('chief_doctor'), assignDoctor);
router.patch('/:id/assign-nurse', protect, authorize('chief_doctor', 'doctor'), assignNurse);
router.patch('/:id/vitals', protect, authorize('chief_doctor', 'doctor', 'nurse'), updateVitals);
router.get('/:id/audit', protect, authorize('chief_doctor', 'doctor'), getAuditLogs);

module.exports = router;
