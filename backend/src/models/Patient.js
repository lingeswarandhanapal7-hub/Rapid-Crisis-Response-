const mongoose = require('mongoose');

const vitalHistorySchema = new mongoose.Schema({
  pulse: { type: Number, required: true },
  bloodPressure: { type: String, default: '' },
  temperature: { type: Number, default: 98.6 },
  oxygenSaturation: { type: Number, default: 98 },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recordedAt: { type: Date, default: Date.now },
});

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: { type: Number, default: 0 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    bloodGroup: { type: String, default: 'Unknown' },
    problem: {
      type: String,
      required: [true, 'Problem/diagnosis is required'],
      trim: true,
    },
    pulse: {
      type: Number,
      default: 72,
    },
    bloodPressure: { type: String, default: '120/80' },
    temperature: { type: Number, default: 98.6 },
    oxygenSaturation: { type: Number, default: 98 },
    status: {
      type: String,
      enum: ['critical', 'moderate', 'stable'],
      default: 'stable',
    },
    room: { type: String, default: '' },
    ward: { type: String, default: 'General' },
    admittedAt: { type: Date, default: Date.now },
    assignedDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedNurseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    linkedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    vitalHistory: [vitalHistorySchema],
    notes: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-compute status based on pulse
patientSchema.pre('save', function (next) {
  if (this.pulse < 50 || this.pulse > 120) {
    this.status = 'critical';
  } else if (this.pulse < 60 || this.pulse > 100) {
    this.status = 'moderate';
  } else {
    this.status = 'stable';
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
