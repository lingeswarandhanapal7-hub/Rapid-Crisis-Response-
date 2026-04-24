const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'PATIENT_CREATED',
        'PATIENT_UPDATED',
        'DOCTOR_ASSIGNED',
        'NURSE_ASSIGNED',
        'VITAL_UPDATED',
        'ALERT_TRIGGERED',
        'PATIENT_DISCHARGED',
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedByName: { type: String },
    performedByRole: { type: String },
    targetPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    targetPatientName: { type: String },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
