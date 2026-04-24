import { motion } from 'framer-motion'
import { Heart, User, Stethoscope, UserCheck, AlertOctagon, AlertTriangle, CheckCircle } from 'lucide-react'
import { BorderRotate } from '../ui/animated-gradient-border'
const statusConfig = {
  critical: {
    badge: 'badge-critical',
    ring: 'ring-2 ring-red-200',
    icon: AlertOctagon,
    iconColor: 'text-red-500',
    cardBorder: 'border-l-4 border-l-red-500',
    pulse: 'text-red-600',
    heartColor: 'text-red-500',
  },
  moderate: {
    badge: 'badge-moderate',
    ring: 'ring-2 ring-orange-200',
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    cardBorder: 'border-l-4 border-l-orange-400',
    pulse: 'text-orange-600',
    heartColor: 'text-orange-500',
  },
  stable: {
    badge: 'badge-stable',
    ring: '',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    cardBorder: 'border-l-4 border-l-green-400',
    pulse: 'text-green-600',
    heartColor: 'text-green-500',
  },
}

export default function PatientCard({ patient, index = 0, onClick }) {
  const cfg = statusConfig[patient.status] || statusConfig.stable
  const StatusIcon = cfg.icon

  return (
    <BorderRotate
      borderRadius={24}
      borderWidth={1}
      animationSpeed={patient.status === 'critical' ? 3 : 10}
      gradientColors={
        patient.status === 'critical' 
          ? { primary: '#ef4444', secondary: '#f87171', accent: '#dc2626' }
          : undefined
      }
      className="h-full"
    >
      <motion.div
        layoutId={`card-${patient._id}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
        whileHover={{ y: -4, scale: 1.01, boxShadow: '0 12px 32px rgba(37,99,235,0.08)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick && onClick(patient)}
        className={`glass-card h-full ${cfg.cardBorder} ${cfg.ring} p-5 cursor-pointer transition-shadow duration-200 bg-white/50`}
      >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shrink-0">
            <User size={18} className="text-primary-700" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm leading-tight">{patient.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{patient.age}y · {patient.gender} · {patient.bloodGroup}</p>
          </div>
        </div>
        <span className={cfg.badge}>
          <StatusIcon size={11} />
          {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
        </span>
      </div>

      {/* Problem */}
      <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mb-3 leading-relaxed line-clamp-2">
        {patient.problem}
      </p>

      {/* Vitals row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <VitalMini
          label="Pulse"
          value={`${patient.pulse}`}
          unit="bpm"
          icon={<Heart size={12} className={`${cfg.heartColor} ${patient.status === 'critical' ? 'animate-heartbeat' : ''}`} />}
          highlight={patient.status !== 'stable'}
        />
        <VitalMini label="SpO₂" value={`${patient.oxygenSaturation}`} unit="%" />
        <VitalMini label="Temp" value={`${patient.temperature}`} unit="°F" />
      </div>

      {/* Assignment */}
      <div className="flex gap-2 text-xs">
        {patient.assignedDoctorId ? (
          <span className="flex items-center gap-1 text-slate-500 bg-blue-50 rounded-lg px-2 py-1">
            <Stethoscope size={11} className="text-primary-500" />
            {patient.assignedDoctorId.name?.split(' ').slice(-1)[0] || 'Dr. Assigned'}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-400 bg-slate-50 rounded-lg px-2 py-1">
            <Stethoscope size={11} /> No Doctor
          </span>
        )}
        {patient.assignedNurseId ? (
          <span className="flex items-center gap-1 text-slate-500 bg-green-50 rounded-lg px-2 py-1">
            <UserCheck size={11} className="text-green-600" />
            {patient.assignedNurseId.name?.split(' ').slice(-1)[0] || 'Assigned'}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-400 bg-slate-50 rounded-lg px-2 py-1">
            <UserCheck size={11} /> No Nurse
          </span>
        )}
        <span className="ml-auto text-slate-400">{patient.ward}</span>
      </div>
      </motion.div>
    </BorderRotate>
  )
}

function VitalMini({ label, value, unit, icon, highlight }) {
  return (
    <div className={`rounded-lg px-2 py-1.5 text-center ${highlight ? 'bg-red-50' : 'bg-slate-50'}`}>
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className={`text-sm font-semibold ${highlight ? 'text-red-700' : 'text-slate-700'}`}>{value}</span>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}
