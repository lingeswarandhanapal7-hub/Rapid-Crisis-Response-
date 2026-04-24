import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Heart, Stethoscope, UserCheck, Activity, Thermometer, Wind, TrendingUp } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import FAB from '../../components/ui/FAB'
import { patientApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { format } from 'date-fns'

export default function PatientDashboard() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientApi.getAll().then(r => r.data),
    refetchInterval: 10000,
  })

  const patient = data?.patients?.[0]

  const chartData = (patient?.vitalHistory || []).slice(-20).map((v, i) => ({
    idx: i + 1,
    pulse: v.pulse,
    spo2: v.oxygenSaturation,
    time: v.recordedAt ? format(new Date(v.recordedAt), 'HH:mm') : `#${i + 1}`,
  }))

  const statusConfig = {
    critical: { color: 'from-red-500 to-rose-600', text: '⚠️ Critical — Medical attention required', badge: 'badge-critical' },
    moderate: { color: 'from-orange-500 to-amber-500', text: '📊 Moderate — Being monitored closely', badge: 'badge-moderate' },
    stable: { color: 'from-green-500 to-emerald-500', text: '✅ Stable — Recovery on track', badge: 'badge-stable' },
  }

  if (isLoading) return (
    <DashboardLayout title="My Health">
      <div className="space-y-4">
        {[0,1,2].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
      </div>
    </DashboardLayout>
  )

  if (!patient) return (
    <DashboardLayout title="My Health">
      <div className="glass-card p-16 text-center">
        <Heart size={40} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500">No health records found yet.</p>
      </div>
    </DashboardLayout>
  )

  const cfg = statusConfig[patient.status] || statusConfig.stable

  return (
    <DashboardLayout title="My Health" breadcrumbs={['Health', 'Overview']}>
      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-6 mb-6 bg-gradient-to-r ${cfg.color} text-white border-0`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-white/80 text-sm mt-1">{cfg.text}</p>
          </div>
          <div className="text-right">
            <div className={`relative inline-flex`}>
              <Heart size={48} className="text-white/30 animate-heartbeat" />
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">{patient.pulse}</span>
            </div>
            <p className="text-white/70 text-xs mt-1">bpm</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — vitals + chart */}
        <div className="lg:col-span-2 space-y-5">
          {/* Current vitals */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
              <Activity size={15} className="text-primary-600" /> Current Vitals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Heart Rate', value: patient.pulse, unit: 'bpm', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', critical: patient.pulse > 100 || patient.pulse < 60 },
                { label: 'Blood Pressure', value: patient.bloodPressure, unit: '', icon: Activity, color: 'text-primary-600', bg: 'bg-blue-50', critical: false },
                { label: 'Temperature', value: patient.temperature, unit: '°F', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50', critical: patient.temperature > 99.5 },
                { label: 'Oxygen Sat.', value: patient.oxygenSaturation, unit: '%', icon: Wind, color: 'text-cyan-600', bg: 'bg-cyan-50', critical: patient.oxygenSaturation < 95 },
              ].map(v => (
                <motion.div
                  key={v.label}
                  whileHover={{ scale: 1.02 }}
                  className={`${v.bg} rounded-2xl p-4 text-center ${v.critical ? 'ring-2 ring-red-200' : ''}`}
                >
                  <v.icon size={22} className={`mx-auto mb-2 ${v.critical ? 'text-red-500 animate-heartbeat' : v.color}`} />
                  <p className="text-2xl font-bold text-slate-800">{v.value}<span className="text-sm font-normal text-slate-400 ml-1">{v.unit}</span></p>
                  <p className="text-xs text-slate-500 mt-1">{v.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pulse chart */}
          {chartData.length > 1 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-primary-600" /> Pulse History
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={[40, 160]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                    formatter={(v) => [`${v} bpm`, 'Pulse']}
                  />
                  <ReferenceLine y={100} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'High', position: 'insideRight', fontSize: 10, fill: '#f97316' }} />
                  <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Low', position: 'insideRight', fontSize: 10, fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="pulse" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right — care team + info */}
        <div className="space-y-5">
          {/* Diagnosis */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-3">My Condition</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{patient.problem}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-400">Ward:</span>
              <span className="text-xs font-medium text-slate-600">{patient.ward}</span>
              <span className="text-xs text-slate-400 ml-2">Room:</span>
              <span className="text-xs font-medium text-slate-600">{patient.room || '—'}</span>
            </div>
          </div>

          {/* Care team */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-4">My Care Team</h3>
            <div className="space-y-3">
              {patient.assignedDoctorId ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                    <Stethoscope size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Your Doctor</p>
                    <p className="text-sm font-semibold text-slate-700">{patient.assignedDoctorId.name}</p>
                    <p className="text-xs text-slate-500">{patient.assignedDoctorId.specialization}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-3">No doctor assigned yet</p>
              )}

              {patient.assignedNurseId ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                    <UserCheck size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Your Nurse</p>
                    <p className="text-sm font-semibold text-slate-700">{patient.assignedNurseId.name}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-3">No nurse assigned yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button */}
      <FAB tooltip="Request Assistance" onClick={() => console.log('Request Assistance')} />
    </DashboardLayout>
  )
}
