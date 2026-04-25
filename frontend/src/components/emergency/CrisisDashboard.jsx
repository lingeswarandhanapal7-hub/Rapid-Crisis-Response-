import React, { useState, useEffect } from 'react';
import CoordinationPanel from './CoordinationPanel';
import CrisisTimeline from './CrisisTimeline';
import SidePanel from '../ui/SidePanel';
import PatientDetail from '../../pages/shared/PatientDetail';
import { User } from 'lucide-react';
// import { useSocket } from '../../context/SocketContext'; // Assuming a socket context

/**
 * CrisisDashboard
 * 2-column layout for Chief Doctors and Doctors
 */
const CrisisDashboard = ({ currentUserRole, currentUserId }) => {
  // const socket = useSocket();
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  // Mock initial data
  useEffect(() => {
    setEmergencies([
      {
        id: 1,
        patient_id: 'mock1',
        patient_name: 'John Doe',
        pulse: 45,
        assigned_staff: 'Dr. Smith, Nurse Joy',
        status: 'alert_triggered',
        created_at: new Date(Date.now() - 50000).toISOString(),
        severity: 'critical'
      },
      {
        id: 2,
        patient_id: 'mock2',
        patient_name: 'Jane Roe',
        pulse: 130,
        assigned_staff: 'Dr. Adams',
        status: 'treatment_started',
        created_at: new Date(Date.now() - 300000).toISOString(),
        severity: 'warning'
      }
    ]);
  }, []);

  useEffect(() => {
    // Note: Use actual socket connection from context in the real app
    // if (!socket) return;
    
    // socket.on('emergency:triggered', handleNewEmergency);
    // socket.on('emergency:status_update', handleStatusUpdate);
    // socket.on('vitals:threshold_breach', handleVitalsUpdate);
    
    // return () => {
    //   socket.off('emergency:triggered');
    //   socket.off('emergency:status_update');
    //   socket.off('vitals:threshold_breach');
    // };
  }, [/* socket */]);

  const sortedEmergencies = [...emergencies].sort((a, b) => {
    // Critical (alert_triggered) at top
    if (a.status === 'alert_triggered' && b.status !== 'alert_triggered') return -1;
    if (a.status !== 'alert_triggered' && b.status === 'alert_triggered') return 1;
    // Then by time
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'alert_triggered':
        return <span className="px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded animate-pulse">CRITICAL</span>;
      case 'doctor_assigned':
      case 'nurse_en_route':
      case 'treatment_started':
        return <span className="px-2 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded">RESPONDING</span>;
      case 'resolved':
        return <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded">RESOLVED</span>;
      default:
        return null;
    }
  };

  const getTimeSince = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-inter">
      {/* LEFT COLUMN: Critical Patients List */}
      <div className="w-1/3 min-w-[320px] bg-[#0F172A] p-4 flex flex-col h-full border-r border-slate-700 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6 tracking-wide">CRITICAL PATIENTS</h2>
        
        <div className="flex flex-col space-y-4">
          {sortedEmergencies.map((em) => (
            <div 
              key={em.id} 
              onClick={() => setSelectedEmergency(em)}
              className={`
                p-4 rounded-lg cursor-pointer transition-all duration-200
                ${selectedEmergency?.id === em.id ? 'bg-slate-800 ring-2 ring-[#3B82F6]' : 'bg-slate-800/50 hover:bg-slate-800'}
                ${em.status === 'alert_triggered' ? 'border-l-4 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-l-4 border-transparent'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{em.patient_name}</h3>
                {getStatusBadge(em.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center text-slate-300">
                  <span className="text-red-400 mr-2">♥</span> 
                  <span className={em.pulse < 50 || em.pulse > 120 ? 'text-red-400 font-bold' : ''}>
                    {em.pulse} bpm
                  </span>
                </div>
                <div className="flex items-center text-slate-400 justify-end">
                  ⏱ {getTimeSince(em.created_at)}
                </div>
                <div className="col-span-2 text-slate-400 text-xs mt-1">
                  Staff: {em.assigned_staff || 'Unassigned'}
                </div>
              </div>
            </div>
          ))}

          {emergencies.length === 0 && (
            <div className="text-slate-500 text-center py-8">
              No active emergencies
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Detail Panel */}
      <div className="flex-1 bg-[#F8FAFC] flex flex-col h-full overflow-hidden">
        {selectedEmergency ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-6 shadow-sm z-10">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-800">{selectedEmergency.patient_name}</h1>
                    <button 
                      onClick={() => setShowPatientDetails(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <User size={14} /> Full Profile
                    </button>
                  </div>
                  <p className="text-slate-500 mt-1">Emergency ID: #{selectedEmergency.id}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-red-600 flex items-center">
                    <span className="text-red-400 mr-2 text-2xl animate-pulse">♥</span>
                    {selectedEmergency.pulse} <span className="text-lg text-slate-500 ml-1 font-normal">bpm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-6">
                <CoordinationPanel 
                  emergency={selectedEmergency} 
                  userId={currentUserId}
                  userRole={currentUserRole}
                />
              </div>
              <div className="w-full lg:w-1/3 min-w-[300px]">
                <CrisisTimeline emergencyId={selectedEmergency.id} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Select a patient to view crisis details</p>
          </div>
        )}
      </div>

      {/* Side Panel for Patient Details */}
      <SidePanel 
        isOpen={showPatientDetails} 
        onClose={() => setShowPatientDetails(false)}
        title="Patient Details"
      >
        {selectedEmergency && selectedEmergency.patient_id && (
          <PatientDetail role={currentUserRole === 'chief_doctor' ? 'chief' : currentUserRole} patientId={selectedEmergency.patient_id} isModal={true} />
        )}
      </SidePanel>
    </div>
  );
};

export default CrisisDashboard;
