const express = require('express');
const router = express.Router();
// const { protect, authorize } = require('../middleware/auth'); // Assuming existing auth middleware

// Mock database interactions since PostgreSQL connection is pending migration
let mockEmergencies = [];
let mockEmergencyEvents = [];

/**
 * @route   POST /api/emergency/trigger
 * @desc    Trigger a new emergency
 * @access  Private (doctor, nurse, patient)
 */
router.post('/trigger', /* protect, authorize('doctor', 'nurse', 'patient'), */ async (req, res) => {
  try {
    const { patient_id, triggered_by, role, trigger_type } = req.body;

    // 1. Create emergency record in PostgreSQL (mocked here)
    const newEmergency = {
      id: Date.now(),
      patient_id,
      triggered_by,
      trigger_type: trigger_type || 'manual',
      severity: 'critical',
      status: 'alert_triggered',
      created_at: new Date().toISOString()
    };
    mockEmergencies.push(newEmergency);

    // 2. Log event in timeline
    mockEmergencyEvents.push({
      id: Date.now() + 1,
      emergency_id: newEmergency.id,
      event_type: 'triggered',
      actor_id: triggered_by,
      actor_role: role,
      message: 'Emergency manually triggered',
      created_at: new Date().toISOString()
    });

    // 3. Emit Socket.io events
    // Assuming the socket handler instances are attached to req.app.locals.emergencySocket 
    // or passed via a global setup.
    const io = req.app.get('io');
    if (io) {
      io.to('emergency:all').emit('emergency:triggered', {
        emergency_id: newEmergency.id,
        patient_id: newEmergency.patient_id,
        severity: newEmergency.severity,
        triggered_by: newEmergency.triggered_by
      });
      
      io.to('emergency:all').emit('emergency:alert_new', {
        emergency_id: newEmergency.id,
        patient_name: `Patient #${patient_id}`, // In real app, fetch patient name
        alert_type: newEmergency.severity
      });
    }

    res.status(201).json({ success: true, data: newEmergency });
  } catch (error) {
    console.error('[RCR] Trigger Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/**
 * @route   PATCH /api/emergency/:id/status
 * @desc    Update status of an emergency
 * @access  Private (chief_doctor, doctor, nurse)
 */
router.patch('/:id/status', /* protect, authorize('chief_doctor', 'doctor', 'nurse'), */ async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updated_by } = req.body;

    // 1. Update emergency in DB (mocked)
    const emergencyIndex = mockEmergencies.findIndex(e => e.id === parseInt(id));
    if (emergencyIndex !== -1) {
      mockEmergencies[emergencyIndex].status = status;
      if (status === 'resolved') {
        mockEmergencies[emergencyIndex].resolved_at = new Date().toISOString();
      }
    }

    // 2. Log event in timeline
    const event = {
      id: Date.now(),
      emergency_id: parseInt(id),
      event_type: 'status_change',
      actor_id: updated_by,
      actor_role: 'staff', // Mocked role
      message: `Status updated to ${status}`,
      created_at: new Date().toISOString()
    };
    mockEmergencyEvents.push(event);

    // 3. Emit Socket.io events
    const io = req.app.get('io');
    if (io) {
      io.to('emergency:all').emit('emergency:status_update', {
        emergency_id: parseInt(id),
        status,
        updated_by,
        timestamp: event.created_at
      });
    }

    res.status(200).json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('[RCR] Status Update Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

/**
 * @route   GET /api/emergency/:id/timeline
 * @desc    Get all events for an emergency
 * @access  Private
 */
router.get('/:id/timeline', /* protect, */ async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch from PostgreSQL (mocked)
    const timeline = mockEmergencyEvents.filter(e => e.emergency_id === parseInt(id))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    console.error('[RCR] Timeline Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
