require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});

    // Create users
    const users = await User.create([
      {
        name: 'Dr. Sarah Mitchell',
        email: 'chief@hospital.com',
        password: 'chief123',
        role: 'chief_doctor',
        specialization: 'Hospital Administration & Cardiology',
      },
      {
        name: 'Dr. James Carter',
        email: 'doctor1@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        specialization: 'Cardiology',
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'doctor2@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        specialization: 'Neurology',
      },
      {
        name: 'Dr. Alan Wong',
        email: 'doctor3@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        specialization: 'Emergency Medicine',
      },
      {
        name: 'Nurse Emily Davis',
        email: 'nurse1@hospital.com',
        password: 'nurse123',
        role: 'nurse',
      },
      {
        name: 'Nurse Robert Kim',
        email: 'nurse2@hospital.com',
        password: 'nurse123',
        role: 'nurse',
      },
      {
        name: 'Nurse Anika Patel',
        email: 'nurse3@hospital.com',
        password: 'nurse123',
        role: 'nurse',
      },
      {
        name: 'John Anderson',
        email: 'patient1@hospital.com',
        password: 'patient123',
        role: 'patient',
      },
      {
        name: 'Maria Santos',
        email: 'patient2@hospital.com',
        password: 'patient123',
        role: 'patient',
      },
    ]);

    const chief = users[0];
    const doctor1 = users[1];
    const doctor2 = users[2];
    const doctor3 = users[3];
    const nurse1 = users[4];
    const nurse2 = users[5];
    const nurse3 = users[6];
    const patientUser1 = users[7];
    const patientUser2 = users[8];

    // Create patients
    await Patient.create([
      {
        name: 'John Anderson',
        age: 58,
        gender: 'male',
        bloodGroup: 'O+',
        problem: 'Acute Myocardial Infarction (Heart Attack)',
        pulse: 135,
        bloodPressure: '160/100',
        temperature: 99.1,
        oxygenSaturation: 92,
        room: '101',
        ward: 'Cardiac ICU',
        assignedDoctorId: doctor1._id,
        assignedNurseId: nurse1._id,
        linkedUserId: patientUser1._id,
        vitalHistory: [
          { pulse: 140, bloodPressure: '165/105', temperature: 99.5, oxygenSaturation: 91, recordedBy: nurse1._id },
          { pulse: 138, bloodPressure: '162/102', temperature: 99.3, oxygenSaturation: 91, recordedBy: nurse1._id },
          { pulse: 135, bloodPressure: '160/100', temperature: 99.1, oxygenSaturation: 92, recordedBy: nurse1._id },
        ],
      },
      {
        name: 'Maria Santos',
        age: 34,
        gender: 'female',
        bloodGroup: 'A+',
        problem: 'Severe Migraine with Aura',
        pulse: 88,
        bloodPressure: '130/85',
        temperature: 98.8,
        oxygenSaturation: 97,
        room: '204',
        ward: 'Neurology',
        assignedDoctorId: doctor2._id,
        assignedNurseId: nurse2._id,
        linkedUserId: patientUser2._id,
        vitalHistory: [
          { pulse: 92, bloodPressure: '135/88', temperature: 99.0, oxygenSaturation: 96, recordedBy: nurse2._id },
          { pulse: 90, bloodPressure: '132/86', temperature: 98.9, oxygenSaturation: 97, recordedBy: nurse2._id },
          { pulse: 88, bloodPressure: '130/85', temperature: 98.8, oxygenSaturation: 97, recordedBy: nurse2._id },
        ],
      },
      {
        name: 'Robert Chen',
        age: 72,
        gender: 'male',
        bloodGroup: 'B-',
        problem: 'Pneumonia with Respiratory Distress',
        pulse: 110,
        bloodPressure: '145/90',
        temperature: 101.2,
        oxygenSaturation: 88,
        room: '305',
        ward: 'Pulmonology',
        assignedDoctorId: doctor3._id,
        assignedNurseId: nurse3._id,
        vitalHistory: [
          { pulse: 118, bloodPressure: '150/95', temperature: 102.0, oxygenSaturation: 85, recordedBy: nurse3._id },
          { pulse: 114, bloodPressure: '148/92', temperature: 101.6, oxygenSaturation: 87, recordedBy: nurse3._id },
          { pulse: 110, bloodPressure: '145/90', temperature: 101.2, oxygenSaturation: 88, recordedBy: nurse3._id },
        ],
      },
      {
        name: 'Lisa Park',
        age: 45,
        gender: 'female',
        bloodGroup: 'AB+',
        problem: 'Type 2 Diabetes — Hyperglycemic Crisis',
        pulse: 72,
        bloodPressure: '122/78',
        temperature: 98.4,
        oxygenSaturation: 99,
        room: '108',
        ward: 'Endocrinology',
        assignedDoctorId: doctor1._id,
        assignedNurseId: nurse1._id,
        vitalHistory: [
          { pulse: 74, bloodPressure: '124/80', temperature: 98.6, oxygenSaturation: 98, recordedBy: nurse1._id },
          { pulse: 73, bloodPressure: '123/79', temperature: 98.5, oxygenSaturation: 98, recordedBy: nurse1._id },
          { pulse: 72, bloodPressure: '122/78', temperature: 98.4, oxygenSaturation: 99, recordedBy: nurse1._id },
        ],
      },
      {
        name: 'David Williams',
        age: 61,
        gender: 'male',
        bloodGroup: 'O-',
        problem: 'Ischemic Stroke — Post-Thrombolysis',
        pulse: 68,
        bloodPressure: '128/82',
        temperature: 98.6,
        oxygenSaturation: 97,
        room: '210',
        ward: 'Neurology ICU',
        assignedDoctorId: doctor2._id,
        assignedNurseId: nurse2._id,
        vitalHistory: [
          { pulse: 65, bloodPressure: '125/80', temperature: 98.4, oxygenSaturation: 96, recordedBy: nurse2._id },
          { pulse: 67, bloodPressure: '127/81', temperature: 98.5, oxygenSaturation: 97, recordedBy: nurse2._id },
          { pulse: 68, bloodPressure: '128/82', temperature: 98.6, oxygenSaturation: 97, recordedBy: nurse2._id },
        ],
      },
    ]);

    console.log('\n✅ Seed complete! Credentials:\n');
    console.log('👑 Chief Doctor  → chief@hospital.com    / chief123');
    console.log('🩺 Doctor 1      → doctor1@hospital.com  / doctor123');
    console.log('🩺 Doctor 2      → doctor2@hospital.com  / doctor123');
    console.log('🩺 Doctor 3      → doctor3@hospital.com  / doctor123');
    console.log('👩‍⚕️ Nurse 1       → nurse1@hospital.com   / nurse123');
    console.log('👩‍⚕️ Nurse 2       → nurse2@hospital.com   / nurse123');
    console.log('👩‍⚕️ Nurse 3       → nurse3@hospital.com   / nurse123');
    console.log('🧑 Patient 1     → patient1@hospital.com / patient123');
    console.log('🧑 Patient 2     → patient2@hospital.com / patient123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
