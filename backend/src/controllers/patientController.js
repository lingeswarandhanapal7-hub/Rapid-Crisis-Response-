const Patient = require('../models/Patient');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper: compute status from pulse
const computeStatus = (pulse) => {
  if (pulse < 50 || pulse > 120) return 'critical';
  if (pulse < 60 || pulse > 100) return 'moderate';
  return 'stable';
};

// Helper: create audit log entry
const createAudit = async (action, performer, patient, details, severity = 'info') => {
  await AuditLog.create({
    action,
    performedBy: performer._id,
    performedByName: performer.name,
    performedByRole: performer.role,
    targetPatient: patient._id,
    targetPatientName: patient.name,
    details,
    severity,
  });
};

// GET /api/patients
const getPatients = async (req, res) => {
  try {
    let query = { isActive: true };
    const { role, _id } = req.user;

    if (role === 'doctor') {
      query.assignedDoctorId = _id;
    } else if (role === 'nurse') {
      query.assignedNurseId = _id;
    } else if (role === 'patient') {
      query.linkedUserId = _id;
    }
    // chief_doctor gets all

    const patients = await Patient.find(query)
      .populate('assignedDoctorId', 'name email specialization')
      .populate('assignedNurseId', 'name email')
      .sort({ status: 1, updatedAt: -1 });

    res.json({ patients });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/patients/:id
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctorId', 'name email specialization')
      .populate('assignedNurseId', 'name email');

    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/patients
const createPatient = async (req, res) => {
  try {
    const { name, age, gender, bloodGroup, problem, pulse, room, ward, notes } = req.body;

    const patient = await Patient.create({
      name, age, gender, bloodGroup, problem,
      pulse: pulse || 72,
      status: computeStatus(pulse || 72),
      room, ward, notes,
    });

    await createAudit('PATIENT_CREATED', req.user, patient, { problem, pulse }, 'info');

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('patient:created', patient);

    res.status(201).json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/patients/:id/assign-doctor
const assignDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { assignedDoctorId: doctorId },
      { new: true }
    ).populate('assignedDoctorId', 'name email specialization')
     .populate('assignedNurseId', 'name email');

    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await createAudit('DOCTOR_ASSIGNED', req.user, patient, { doctorName: doctor.name, doctorId }, 'info');

    const io = req.app.get('io');
    if (io) io.emit('patient:updated', patient);

    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/patients/:id/assign-nurse
const assignNurse = async (req, res) => {
  try {
    const { nurseId } = req.body;
    const nurse = await User.findOne({ _id: nurseId, role: 'nurse' });
    if (!nurse) return res.status(404).json({ message: 'Nurse not found' });

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { assignedNurseId: nurseId },
      { new: true }
    ).populate('assignedDoctorId', 'name email specialization')
     .populate('assignedNurseId', 'name email');

    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await createAudit('NURSE_ASSIGNED', req.user, patient, { nurseName: nurse.name, nurseId }, 'info');

    const io = req.app.get('io');
    if (io) io.emit('patient:updated', patient);

    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/patients/:id/vitals
const updateVitals = async (req, res) => {
  try {
    const { pulse, bloodPressure, temperature, oxygenSaturation } = req.body;

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const previousStatus = patient.status;

    // Push to vital history
    patient.vitalHistory.push({
      pulse,
      bloodPressure,
      temperature,
      oxygenSaturation,
      recordedBy: req.user._id,
    });

    patient.pulse = pulse;
    if (bloodPressure) patient.bloodPressure = bloodPressure;
    if (temperature) patient.temperature = temperature;
    if (oxygenSaturation) patient.oxygenSaturation = oxygenSaturation;
    patient.status = computeStatus(pulse);

    // Keep last 50 vital records
    if (patient.vitalHistory.length > 50) {
      patient.vitalHistory = patient.vitalHistory.slice(-50);
    }

    await patient.save();

    const severity = patient.status === 'critical' ? 'critical' : patient.status === 'moderate' ? 'warning' : 'info';
    await createAudit('VITAL_UPDATED', req.user, patient, { pulse, bloodPressure, temperature, oxygenSaturation, previousStatus, newStatus: patient.status }, severity);

    const io = req.app.get('io');
    if (io) {
      io.emit('patient:vitals', { patientId: patient._id, pulse, status: patient.status, bloodPressure, temperature, oxygenSaturation });

      // Smart Alert Detection for RCR System
      const emergencySockets = req.app.get('emergencySocket');
      const isPulseCritical = pulse < 50 || pulse > 120;
      const isSpo2Critical = oxygenSaturation < 90;
      const isTempCritical = temperature < 95 || temperature > 100.4;
      
      if (emergencySockets && (isPulseCritical || isSpo2Critical || isTempCritical)) {
        let breachMetric = 'pulse';
        let breachValue = pulse;
        let breachThreshold = 120;

        if (isPulseCritical) {
           breachThreshold = pulse < 50 ? 50 : 120;
        } else if (isSpo2Critical) {
           breachMetric = 'spo2';
           breachValue = oxygenSaturation;
           breachThreshold = 90;
        } else {
           breachMetric = 'temperature';
           breachValue = temperature;
           breachThreshold = temperature < 95 ? 95 : 100.4;
        }

        emergencySockets.emitVitalsBreach({
          patient_id: patient._id,
          metric: breachMetric,
          value: breachValue,
          threshold: breachThreshold
        });

        emergencySockets.emitEmergencyTriggered({
          emergency_id: Date.now(),
          patient_id: patient._id,
          patient_name: patient.name,
          severity: 'critical',
          triggered_by: 'system',
          trigger_type: 'auto',
          doctorId: patient.assignedDoctorId,
          nurseId: patient.assignedNurseId
        });
      }

      // Fire alert if critical
      if (patient.status === 'critical') {
        const alertPayload = {
          type: 'critical',
          message: `🚨 CRITICAL: ${patient.name} has abnormal vitals!`,
          patient: { id: patient._id, name: patient.name },
          doctorId: patient.assignedDoctorId,
          nurseId: patient.assignedNurseId,
          timestamp: new Date(),
        };
        
        let emitChain = io.to('chief_doctor');
        if (patient.assignedDoctorId) emitChain = emitChain.to(`user:${patient.assignedDoctorId}`);
        if (patient.assignedNurseId) emitChain = emitChain.to(`user:${patient.assignedNurseId}`);
        
        emitChain.emit('alert:critical', alertPayload);
        
        await createAudit('ALERT_TRIGGERED', req.user, patient, alertPayload, 'critical');
      } else if (patient.status === 'moderate' && previousStatus !== 'moderate') {
        io.emit('alert:warning', {
          type: 'warning',
          message: `⚠️ WARNING: ${patient.name} pulse is ${pulse} bpm (moderate)`,
          patient: { id: patient._id, name: patient.name },
          timestamp: new Date(),
        });
      }
    }

    await patient.populate('assignedDoctorId', 'name email specialization');
    await patient.populate('assignedNurseId', 'name email');

    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/audit/:patientId
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ targetPatient: req.params.patientId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/stats
const getStats = async (req, res) => {
  try {
    const [total, critical, moderate, stable] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Patient.countDocuments({ isActive: true, status: 'critical' }),
      Patient.countDocuments({ isActive: true, status: 'moderate' }),
      Patient.countDocuments({ isActive: true, status: 'stable' }),
    ]);
    res.json({ total, critical, moderate, stable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPatients, getPatient, createPatient, assignDoctor, assignNurse, updateVitals, getAuditLogs, getStats };
