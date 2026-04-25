/**
 * Rapid Crisis Response System - Socket.io Handler
 * 
 * Manages real-time emergency events and role-based rooms.
 */

module.exports = function initializeEmergencySocket(io) {
  io.on('connection', (socket) => {
    // 1. Join appropriate emergency rooms based on role
    // Expected client payload: { role: 'doctor', department: 'cardiology', patientId: null }
    socket.on('emergency:join', (data) => {
      const { role, department, patientId } = data;

      if (role === 'chief_doctor') {
        socket.join('emergency:all');
        console.log(`[RCR] Chief Doctor joined emergency:all`);
      } else if (role === 'doctor' || role === 'nurse') {
        if (department) {
          socket.join(`emergency:${department}`);
          console.log(`[RCR] Staff joined emergency:${department}`);
        }
      } else if (role === 'patient') {
        if (patientId) {
          socket.join(`emergency:${patientId}`);
          console.log(`[RCR] Patient joined emergency:${patientId}`);
        }
      }
    });

    // 2. Client Emit: emergency:acknowledge
    socket.on('emergency:acknowledge', async (data) => {
      const { emergency_id, acknowledged_by } = data;
      // In a real app, update emergency_notifications table here
      
      // Log event
      console.log(`[RCR] Emergency ${emergency_id} acknowledged by ${acknowledged_by}`);
      
      // Emit update back to relevant rooms so UI can update
      io.to('emergency:all').emit('emergency:acknowledged', data);
    });

    // 3. Client Emit: emergency:quick_message
    socket.on('emergency:quick_message', async (data) => {
      const { emergency_id, message_type, sender_id } = data;
      // In a real app, insert into emergency_events table here
      
      console.log(`[RCR] Quick message for emergency ${emergency_id}: ${message_type}`);
      
      // Broadcast to coordination panel
      io.to('emergency:all').emit('emergency:timeline_update', {
        emergency_id,
        event_type: 'quick_message',
        actor_id: sender_id,
        message: message_type,
        timestamp: new Date().toISOString()
      });
    });
  });

  // Helper function to emit events from Express routes
  return {
    emitEmergencyTriggered: (emergencyData) => {
      // 1. Emit to all chief doctors
      io.to('emergency:all').emit('emergency:alert_new', {
        emergency_id: emergencyData.emergency_id,
        patient_name: emergencyData.patient_name || 'Unknown Patient',
        alert_type: emergencyData.severity || 'critical'
      });
      io.to('emergency:all').emit('emergency:triggered', emergencyData);

      // 2. Emit to specific assigned doctor
      if (emergencyData.doctorId) {
        const docId = emergencyData.doctorId.toString();
        io.to(`user:${docId}`).emit('emergency:alert_new', {
          emergency_id: emergencyData.emergency_id,
          patient_name: emergencyData.patient_name || 'Unknown Patient',
          alert_type: emergencyData.severity || 'critical'
        });
        io.to(`user:${docId}`).emit('emergency:triggered', emergencyData);
      }

      // 3. Emit to specific assigned nurse
      if (emergencyData.nurseId) {
        const nurseId = emergencyData.nurseId.toString();
        io.to(`user:${nurseId}`).emit('emergency:alert_new', {
          emergency_id: emergencyData.emergency_id,
          patient_name: emergencyData.patient_name || 'Unknown Patient',
          alert_type: emergencyData.severity || 'critical'
        });
        io.to(`user:${nurseId}`).emit('emergency:triggered', emergencyData);
      }
    },

    emitStatusUpdate: (updateData) => {
      io.to('emergency:all').emit('emergency:status_update', {
        emergency_id: updateData.emergency_id,
        status: updateData.status,
        updated_by: updateData.updated_by,
        timestamp: new Date().toISOString()
      });
    },

    emitVitalsBreach: (breachData) => {
      io.to('emergency:all').emit('vitals:threshold_breach', breachData);
    }
  };
};
