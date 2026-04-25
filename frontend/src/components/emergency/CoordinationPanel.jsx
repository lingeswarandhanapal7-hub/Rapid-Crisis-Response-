import React, { useState } from 'react';
// import { useSocket } from '../../context/SocketContext';

const STATUS_FLOW = [
  { id: 'alert_triggered', label: 'Alert Triggered' },
  { id: 'doctor_assigned', label: 'Doctor Assigned' },
  { id: 'nurse_en_route', label: 'Nurse En Route' },
  { id: 'treatment_started', label: 'Treatment Started' },
  { id: 'resolved', label: 'Resolved' }
];

const QUICK_MESSAGES = [
  'Need Assistance',
  'Patient Critical',
  'Vitals Unstable',
  'Resolved'
];

/**
 * CoordinationPanel
 * Allows staff to update status and send quick messages
 */
const CoordinationPanel = ({ emergency, userId, userRole }) => {
  // const socket = useSocket();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentStatusIndex = STATUS_FLOW.findIndex(s => s.id === emergency?.status);

  const handleStatusUpdate = async (newStatusId) => {
    if (!emergency || isUpdating) return;
    setIsUpdating(true);

    try {
      // 1. API Call
      await fetch(`/api/emergency/${emergency.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatusId, updated_by: userId })
      });

      // 2. Socket Emit is handled by backend, but we could also emit directly if needed
      // if (socket) {
      //   socket.emit('emergency:status_update', { 
      //     emergency_id: emergency.id, 
      //     status: newStatusId, 
      //     updated_by: userId 
      //   });
      // }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const sendQuickMessage = (message) => {
    if (!emergency) return;
    
    // if (socket) {
    //   socket.emit('emergency:quick_message', {
    //     emergency_id: emergency.id,
    //     message_type: message,
    //     sender_id: userId
    //   });
    // }
    console.log(`Sending message: ${message}`);
  };

  if (!emergency) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 font-inter">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Live Coordination</h3>
      
      {/* Status Flow Tracker */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Response Status</h4>
        <div className="flex justify-between relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-[#3B82F6] -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${(Math.max(0, currentStatusIndex) / (STATUS_FLOW.length - 1)) * 100}%` }}
          ></div>

          {STATUS_FLOW.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                <button
                  onClick={() => handleStatusUpdate(step.id)}
                  disabled={isUpdating || (userRole === 'patient')}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all
                    ${isCompleted ? 'bg-[#3B82F6] text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}
                    ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}
                    ${userRole !== 'patient' ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {isCompleted ? '✓' : idx + 1}
                </button>
                <span className={`
                  mt-2 text-xs font-medium text-center w-20 leading-tight
                  ${isCurrent ? 'text-slate-800 font-bold' : 'text-slate-400'}
                `}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Messages */}
      {userRole !== 'patient' && (
        <div>
          <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            {QUICK_MESSAGES.map((msg) => (
              <button
                key={msg}
                onClick={() => sendQuickMessage(msg)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-colors border
                  ${msg === 'Need Assistance' ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' : ''}
                  ${msg === 'Patient Critical' ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : ''}
                  ${msg === 'Vitals Unstable' ? 'border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100' : ''}
                  ${msg === 'Resolved' ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100' : ''}
                `}
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinationPanel;
