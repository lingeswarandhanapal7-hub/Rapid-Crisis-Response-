import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Stethoscope, UserCheck, Heart, Thermometer, Wind, Activity, Save, Loader2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { patientApi, userApi } from '../../api/services'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import EmergencyButton from '../../components/emergency/EmergencyButton'
import { useAuthStore } from '../../store/authStore'

const statusColors = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  moderate: 'text-orange-600 bg-orange-50 border-orange-200',
  stable: 'text-green-600 bg-green-50 border-green-200',
}

interface PatientDetailProps {
  role?: 'chief' | 'doctor' | 'nurse' | 'patient';
  patientId?: string;
  isModal?: boolean;
}

export default function PatientDetail({ role = 'chief', patientId: propId, isModal = false }: PatientDetailProps) {
  const { id: routeId } = useParams()
  const id = propId || routeId
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [doctorId, setDoctorId] = useState('')
  const [nurseId, setNurseId] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientApi.getOne(id).then(r => r.data),
  })

  // Pre-fill selection
  useEffect(() => {
    if (data?.patient) {
      setDoctorId(data.patient.assignedDoctorId?._id || '')
      setNurseId(data.patient.assignedNurseId?._id || '')
    }
  }, [data])
  const { data: doctorData } = useQuery({
    queryKey: ['users', 'doctor'],
    queryFn: () => userApi.getDoctors().then(r => r.data),
  })
  const { data: nurseData } = useQuery({
    queryKey: ['users', 'nurse'],
    queryFn: () => userApi.getNurses().then(r => r.data),
  })

  const assignDoctorMut = useMutation({
    mutationFn: () => patientApi.assignDoctor(id, doctorId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patient', id] }); toast.success('Doctor assigned!') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })
  const assignNurseMut = useMutation({
    mutationFn: () => patientApi.assignNurse(id, nurseId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patient', id] }); toast.success('Nurse assigned!') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  })

  const patient = data?.patient
  const doctors = doctorData?.users || []
  const nurses = nurseData?.users || []

  const chartData = (patient?.vitalHistory || []).map((v, i) => ({
    name: `#${i + 1}`,
    pulse: v.pulse,
    spo2: v.oxygenSaturation,
    temp: v.temperature,
    time: v.recordedAt ? format(new Date(v.recordedAt), 'HH:mm') : '',
  }))

  if (isLoading) {
    const loader = (
      <div className="animate-pulse space-y-4 w-full">
        <div className="h-32 skeleton rounded-2xl" />
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    )
    return isModal ? loader : <DashboardLayout title="Patient Details">{loader}</DashboardLayout>
  }

  if (!patient) {
    const notFound = <p className="text-slate-500">Patient not found.</p>
    return isModal ? notFound : <DashboardLayout title="Not Found">{notFound}</DashboardLayout>
  }

  const backPath = `/${role}`

  const content = (
    <>
      {!isModal && (
        <motion.button
          onClick={() => navigate(backPath)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </motion.button>
      )}

      <div className={`grid ${isModal ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        {/* Patient info */}
        <div className={`${isModal ? '' : 'lg:col-span-2'} space-y-5`}>
          {/* Header card */}
          <div className={`glass-card p-6 border-l-4 ${patient.status === 'critical' ? 'border-l-red-500' : patient.status === 'moderate' ? 'border-l-orange-400' : 'border-l-green-400'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
                <p className="text-slate-500 text-sm mt-0.5">{patient.age}y · {patient.gender} · {patient.bloodGroup} · Room {patient.room}, {patient.ward}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${statusColors[patient.status]}`}>
                {patient.status.toUpperCase()}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Primary Diagnosis</p>
              <p className="text-sm font-medium text-slate-700">{patient.problem}</p>
            </div>
          </div>

          {/* Vitals grid */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
              <Activity size={15} className="text-primary-600" /> Current Vitals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Pulse', value: patient.pulse, unit: 'bpm', icon: Heart, color: 'text-red-500', critical: patient.pulse < 50 || patient.pulse > 120 },
                { label: 'Blood Pressure', value: patient.bloodPressure, unit: '', icon: Activity, color: 'text-primary-600', critical: false },
                { label: 'Temperature', value: patient.temperature, unit: '°F', icon: Thermometer, color: 'text-orange-500', critical: patient.temperature > 100 },
                { label: 'SpO₂', value: patient.oxygenSaturation, unit: '%', icon: Wind, color: 'text-cyan-600', critical: patient.oxygenSaturation < 95 },
              ].map(v => (
                <div key={v.label} className={`rounded-xl p-3 text-center ${v.critical ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                  <v.icon size={18} className={`mx-auto mb-1 ${v.critical ? 'text-red-500 animate-heartbeat' : v.color}`} />
                  <p className={`text-xl font-bold ${v.critical ? 'text-red-700' : 'text-slate-800'}`}>{v.value}<span className="text-xs font-normal text-slate-400 ml-0.5">{v.unit}</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">{v.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vitals history chart */}
          {chartData.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
                <Heart size={15} className="text-red-500" /> Pulse History
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                    formatter={(v) => [`${v} bpm`, 'Pulse']}
                  />
                  <Line
                    type="monotone"
                    dataKey="pulse"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right column — assignments */}
        <div className="space-y-5">
          {/* Current assignments */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-slate-700 text-sm mb-4">Assigned Staff</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Stethoscope size={15} className="text-primary-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Doctor</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {patient.assignedDoctorId?.name || 'Not assigned'}
                  </p>
                  {patient.assignedDoctorId?.specialization && (
                    <p className="text-xs text-slate-400 truncate">{patient.assignedDoctorId.specialization}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <UserCheck size={15} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Nurse</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {patient.assignedNurseId?.name || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assign doctor (chief only) */}
          {role === 'chief' && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-3">Assign Doctor</h3>
              <select
                value={doctorId}
                onChange={e => setDoctorId(e.target.value)}
                className="input-field mb-3"
              >
                <option value="">Select a doctor…</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>{d.name} — {d.specialization || 'General'}</option>
                ))}
              </select>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!doctorId || assignDoctorMut.isPending}
                onClick={() => assignDoctorMut.mutate()}
                className="btn-primary w-full"
              >
                {assignDoctorMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Assign Doctor
              </motion.button>
            </div>
          )}

          {/* Assign nurse (chief + doctor) */}
          {(role === 'chief' || role === 'doctor') && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-slate-700 text-sm mb-3">Assign Nurse</h3>
              <select
                value={nurseId}
                onChange={e => setNurseId(e.target.value)}
                className="input-field mb-3"
              >
                <option value="">Select a nurse…</option>
                {nurses.map(n => (
                  <option key={n._id} value={n._id}>{n.name}</option>
                ))}
              </select>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!nurseId || assignNurseMut.isPending}
                onClick={() => assignNurseMut.mutate()}
                className="btn-primary w-full"
              >
                {assignNurseMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Assign Nurse
              </motion.button>
            </div>
          )}
        </div>
      </div>
      
      {/* Test Auto-Alert Button (Dev only) */}
      <div className={`mt-6 flex ${isModal ? 'justify-start' : 'justify-end'}`}>
        <button
          onClick={() => {
            const vitals = {
              pulse: 155,
              bloodPressure: '180/110',
              temperature: 101.5,
              oxygenSaturation: 88
            }
            patientApi.updateVitals(patient._id, vitals)
              .then(() => toast.success('Simulated critical vitals drop!'))
              .catch(() => toast.error('Failed to simulate vitals'))
          }}
          className="flex items-center gap-2 text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors border border-slate-300 shadow-sm"
        >
          🧪 Simulate Vitals Drop (Test Alert)
        </button>
      </div>
      
      {/* Emergency Button for Staff */}
      {patient && (
        <div className={`fixed ${isModal ? 'bottom-6 right-6' : 'bottom-6 right-6'} z-[200]`}>
          <EmergencyButton role={user?.role} patientId={patient._id} userId={user?._id || user?.id} />
        </div>
      )}
    </>
  )

  if (isModal) return content

  return (
    <DashboardLayout
      title={patient.name}
      breadcrumbs={[role === 'chief' ? 'Hospital' : 'Dashboard', 'Patients', patient.name]}
    >
      {content}
    </DashboardLayout>
  )
}
