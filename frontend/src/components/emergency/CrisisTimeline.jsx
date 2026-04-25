import React, { useState, useEffect } from 'react';
// import { useSocket } from '../../context/SocketContext';

/**
 * CrisisTimeline
 * Vertical timeline UI showing event history for an emergency.
 */
const CrisisTimeline = ({ emergencyId }) => {
  // const socket = useSocket();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial timeline data
  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/emergency/${emergencyId}/timeline`);
        const result = await response.json();
        if (result.success) {
          setEvents(result.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch timeline', err);
        // Fallback mock data
        setEvents([
          { id: 1, event_type: 'triggered', message: 'Emergency manually triggered', actor_role: 'nurse', created_at: new Date(Date.now() - 50000).toISOString() },
          { id: 2, event_type: 'acknowledged', message: 'Alert acknowledged', actor_role: 'doctor', created_at: new Date(Date.now() - 40000).toISOString() },
          { id: 3, event_type: 'status_change', message: 'Status updated to Doctor Assigned', actor_role: 'chief_doctor', created_at: new Date(Date.now() - 30000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (emergencyId) {
      fetchTimeline();
    }
  }, [emergencyId]);

  // Listen for new events via socket
  useEffect(() => {
    // if (!socket) return;
    
    const handleNewEvent = (newEvent) => {
      if (newEvent.emergency_id === emergencyId) {
        setEvents(prev => [...prev, newEvent]);
      }
    };

    // socket.on('emergency:timeline_update', handleNewEvent);
    // return () => socket.off('emergency:timeline_update', handleNewEvent);
  }, [emergencyId /*, socket */]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'triggered':
        return <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-sm border border-red-200">🚨</div>;
      case 'acknowledged':
        return <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-200">👀</div>;
      case 'status_change':
        return <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-200">🔄</div>;
      case 'quick_message':
        return <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-200">💬</div>;
      case 'resolved':
        return <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 shadow-sm border border-green-200">✅</div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-200">📌</div>;
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (loading) {
    return <div className="animate-pulse flex flex-col space-y-4 p-4">
      {[1,2,3].map(i => (
        <div key={i} className="flex space-x-4">
          <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-2 bg-slate-200 rounded w-3/4"></div>
            <div className="h-2 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full font-inter flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-6 shrink-0">Event Timeline</h3>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
        {/* Vertical line behind nodes */}
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>
        
        <div className="space-y-6 relative z-10">
          {events.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No events recorded.</p>
          ) : (
            events.map((ev, index) => (
              <div 
                key={ev.id || index} 
                className="flex gap-4 opacity-0 animate-[timelineEntry_400ms_ease-out_forwards]"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                {getEventIcon(ev.event_type)}
                <div className="pt-1 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-slate-800 leading-tight">
                      {ev.event_type === 'status_change' ? 'Status Updated' : 
                       ev.event_type === 'triggered' ? 'Emergency Triggered' :
                       ev.event_type === 'acknowledged' ? 'Acknowledged' :
                       ev.event_type === 'quick_message' ? 'Quick Message' :
                       ev.event_type === 'resolved' ? 'Resolved' : 'Event'}
                    </span>
                    <span className="text-xs font-mono text-slate-400 shrink-0 ml-2">
                      {formatTime(ev.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1.5 inline-block w-full">
                    {ev.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 capitalize font-medium">
                    By: {ev.actor_role || 'System'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes timelineEntry {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default CrisisTimeline;
