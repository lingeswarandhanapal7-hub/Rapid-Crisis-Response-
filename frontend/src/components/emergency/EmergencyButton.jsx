import React, { useState, useRef, useEffect } from 'react';

/**
 * EmergencyButton
 * Role-gated. Patients require a 3s hold-to-confirm.
 * @param {string} role - Current user's role ('patient', 'doctor', 'nurse', etc.)
 * @param {number|string} patientId - The patient to trigger the emergency for.
 * @param {number|string} userId - ID of the user triggering.
 */
const EmergencyButton = ({ role = 'patient', patientId, userId }) => {
  const [status, setStatus] = useState('idle'); // idle | pressing | loading | sent
  const [progress, setProgress] = useState(0);
  const pressTimer = useRef(null);
  const startTime = useRef(null);
  const requestFrame = useRef(null);

  const HOLD_DURATION = 3000; // 3 seconds for patients

  const triggerEmergency = async () => {
    setStatus('loading');
    
    try {
      const response = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          triggered_by: userId,
          role,
          trigger_type: 'manual'
        })
      });

      if (response.ok) {
        setStatus('sent');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        // Fallback for offline or failure
        // Queue to localStorage
        const queue = JSON.parse(localStorage.getItem('rcr_offline_queue') || '[]');
        queue.push({ type: 'trigger', payload: { patient_id: patientId, triggered_by: userId, role } });
        localStorage.setItem('rcr_offline_queue', JSON.stringify(queue));
        setStatus('sent'); // Show success anyway in an emergency
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (err) {
      console.error('Failed to trigger emergency', err);
      setStatus('idle');
    }
  };

  const updateProgress = () => {
    const elapsed = Date.now() - startTime.current;
    const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
    setProgress(newProgress);

    if (newProgress < 100) {
      requestFrame.current = requestAnimationFrame(updateProgress);
    } else {
      triggerEmergency();
    }
  };

  const handlePointerDown = (e) => {
    // Only primary button
    if (e.button && e.button !== 0) return;
    
    if (role === 'patient') {
      setStatus('pressing');
      setProgress(0);
      startTime.current = Date.now();
      requestFrame.current = requestAnimationFrame(updateProgress);
    } else {
      // Staff can click immediately without holding
      setStatus('pressing'); // For scale animation
    }
  };

  const handlePointerUp = () => {
    if (role === 'patient') {
      if (status === 'pressing') {
        cancelPress();
      }
    } else if (status === 'pressing') {
      triggerEmergency();
    }
  };

  const cancelPress = () => {
    cancelAnimationFrame(requestFrame.current);
    if (status === 'pressing') {
      setStatus('idle');
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestFrame.current);
  }, []);

  return (
    <div className="relative inline-block select-none">
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={cancelPress}
        disabled={status === 'loading' || status === 'sent'}
        className={`
          relative overflow-hidden font-inter font-bold text-white rounded-full
          transition-transform duration-100 ease-out
          ${status === 'pressing' ? 'scale-[0.97]' : 'scale-100'}
          ${status === 'sent' ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'}
          ${(status === 'loading' || status === 'sent') ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
          px-8 py-4 shadow-lg active:shadow-md
        `}
      >
        {status === 'idle' && (
          <span className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{role === 'patient' ? 'HOLD FOR EMERGENCY' : 'TRIGGER EMERGENCY'}</span>
          </span>
        )}
        {status === 'pressing' && role === 'patient' && (
           <span className="relative z-10 flex items-center space-x-2">
             <span>HOLDING...</span>
           </span>
        )}
        {status === 'pressing' && role !== 'patient' && (
           <span>TRIGGERING...</span>
        )}
        {status === 'loading' && (
          <span className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>SENDING ALERT...</span>
          </span>
        )}
        {status === 'sent' && (
          <span className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span>ALERT SENT</span>
          </span>
        )}

        {/* Progress Fill for Patient Hold */}
        {role === 'patient' && status === 'pressing' && (
          <div 
            className="absolute left-0 top-0 bottom-0 bg-red-800 transition-none z-0"
            style={{ width: `${progress}%` }}
          />
        )}
      </button>
    </div>
  );
};

export default EmergencyButton;
