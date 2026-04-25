import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';

/**
 * AlertFeed
 * Slide-in panel for emergency alerts.
 * @param {string} userId - Current user's ID
 */
const AlertFeed = ({ userId }) => {
  const socket = useSocket();
  const [alerts, setAlerts] = useState([]);

  const playBeep = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (err) {
      console.error('Audio play failed', err);
    }
  }, []);

  const addAlert = useCallback((newAlert) => {
    setAlerts((prev) => {
      // Prevent duplicates
      if (prev.find(a => a.emergency_id === newAlert.emergency_id)) return prev;
      
      playBeep();
      return [{ ...newAlert, timestamp: Date.now(), acknowledged: false }, ...prev];
    });

    // Auto-dismiss after 10s if not acknowledged
    // In a real app, you might just hide it, but the spec says "persists with red dot". 
    // We'll remove it from the slide-in but keep a count, or just hide the slide-in aspect.
    // For simplicity, we just mark it as auto-dismissed from the popup view.
    setTimeout(() => {
      setAlerts((prev) => 
        prev.map(a => 
          a.emergency_id === newAlert.emergency_id && !a.acknowledged 
            ? { ...a, hidden: true } 
            : a
        )
      );
    }, 10000);
  }, [playBeep]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('emergency:alert_new', addAlert);
    
    return () => {
      socket.off('emergency:alert_new', addAlert);
    };
  }, [socket, addAlert]);

  const handleAcknowledge = (emergency_id) => {
    if (socket) {
      socket.emit('emergency:acknowledge', { emergency_id, acknowledged_by: userId });
    }
    
    setAlerts((prev) => 
      prev.map(a => 
        a.emergency_id === emergency_id ? { ...a, acknowledged: true, hidden: true } : a
      )
    );
  };

  const visibleAlerts = alerts.filter(a => !a.hidden);
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <>
      {/* Invisible element to expose count if needed by parent nav */}
      <div id="rcr-unacknowledged-count" data-count={unacknowledgedCount} className="hidden" />

      {/* Slide-in container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col space-y-3 w-80 pointer-events-none">
        {visibleAlerts.map((alert) => (
          <div 
            key={alert.emergency_id}
            className={`
              pointer-events-auto overflow-hidden bg-white rounded-lg shadow-xl border-l-4
              ${alert.alert_type === 'critical' ? 'border-red-600' : 'border-amber-500'}
              transform transition-all duration-350 ease-out
              animate-[slideIn_350ms_ease-out]
            `}
          >
            {/* Inline keyframes for animation */}
            <style>{`
              @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>

            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 font-inter text-sm">
                    {alert.alert_type === 'critical' ? 'CRITICAL ALERT' : 'WARNING'}
                  </h4>
                  <p className="text-slate-600 font-medium mt-1">{alert.patient_name}</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleAcknowledge(alert.emergency_id)}
                  className="px-4 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded transition-colors"
                >
                  ACKNOWLEDGE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AlertFeed;
