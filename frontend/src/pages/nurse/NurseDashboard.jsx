import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Heart, Thermometer, Wind, Activity, Loader2, Save, UserCheck, Stethoscope } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { patientApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import SidePanel from '../../components/ui/SidePanel'
import PatientDetail from '../shared/PatientDetail'
import FAB from '../../components/ui/FAB'
import toast from 'react-hot-toast'

export default function NurseDashboard() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [selectedPatientId, setSelectedPatientId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientApi.getAll().then(r => r.data),
    refetchInterval: 10000,
  })

  const patients = data?.patients || []

  return (
    <DashboardLayout title="Nurse Dashboard" breadcrumbs={['Dashboard', 'My Patients']}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0"
      >
        <h2 className="font-bold text-lg">Hello, {user?.name?.split(' ').slice(1).join(' ') || user?.name} 👩‍⚕️</h2>
        <p className="text-emerald-100 text-sm mt-0.5">{patients.length} patients under your care</p>
      </motion.div>

      {isLoading && (
        <div className="space-y-4">
          {[0, 1, 2].map(i => <VitalSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && patients.length === 0 && (
        <div className="glass-card p-16 text-center">
          <UserCheck size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No patients assigned yet</p>
        </div>
      )}

      <div className="space-y-4">
        {patients.map((patient, i) => (
          <VitalUpdateCard 
            key={patient._id} 
            patient={patient} 
            index={i} 
            qc={qc} 
            onViewDetails={() => setSelectedPatientId(patient._id)}
          />
        ))}
      </div>

      {/* Floating Action Button */}
      <FAB tooltip="Add Supply Note" onClick={() => console.log('Add Supply Note')} />

      {/* Side Panel for Patient Details */}
      <SidePanel 
        isOpen={!!selectedPatientId} 
        onClose={() => setSelectedPatientId(null)}
        title="Patient Details"
      >
        {selectedPatientId && (
          <PatientDetail role="nurse" patientId={selectedPatientId} isModal={true} />
        )}
      </SidePanel>
    </DashboardLayout>
  )
}

function VitalUpdateCard({ patient, index, qc, onViewDetails }) {
  const [pulse, setPulse] = useState(patient.pulse)
  const [bp, setBp] = useState(patient.bloodPressure)
  const [temp, setTemp] = useState(patient.temperature)
  const [spo2, setSpo2] = useState(patient.oxygenSaturation)

  const mut = useMutation({
    mutationFn: () => patientApi.updateVitals(patient._id, {
      pulse: Number(pulse),
      bloodPressure: bp,
      temperature: Number(temp),
      oxygenSaturation: Number(spo2),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      toast.success(`Vitals updated for ${patient.name}`)
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  })

  const statusBorderColor = {
    critical: 'border-l-red-500',
    moderate: 'border-l-orange-400',
    stable: 'border-l-green-400',
  }[patient.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`glass-card p-5 border-l-4 ${statusBorderColor}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">{patient.name}</h3>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Stethoscope size={11} /> {patient.assignedDoctorId?.name || 'No doctor'}</span>
            <span>· {patient.ward} · Room {patient.room}</span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          patient.status === 'critical' ? 'badge-critical' :
          patient.status === 'moderate' ? 'badge-moderate' : 'badge-stable'
        }`}>
          {patient.status}
        </span>
      </div>

      {/* Problem */}
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-4">{patient.problem}</p>

      {/* Vitals inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <VitalInput label="Pulse (bpm)" icon={Heart} iconColor="text-red-500" value={pulse} onChange={setPulse} type="number" min={20} max={250} />
        <VitalInput label="Blood Pressure" icon={Activity} iconColor="text-primary-600" value={bp} onChange={setBp} type="text" placeholder="120/80" />
        <VitalInput label="Temp (°F)" icon={Thermometer} iconColor="text-orange-500" value={temp} onChange={setTemp} type="number" step="0.1" />
        <VitalInput label="SpO₂ (%)" icon={Wind} iconColor="text-cyan-600" value={spo2} onChange={setSpo2} type="number" min={60} max={100} />
      </div>

      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="btn-primary flex-1"
        >
          {mut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Update Vitals
        </motion.button>
        <button
          onClick={onViewDetails}
          className="btn-secondary"
        >
          View Details
        </button>
      </div>
    </motion.div>
  )
}

function VitalInput({ label, icon: Icon, iconColor, value, onChange, ...rest }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
        <Icon size={12} className={iconColor} /> {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field text-sm"
        {...rest}
      />
    </div>
  )
}

function VitalSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-1.5">
          <div className="h-4 skeleton rounded w-40" />
          <div className="h-3 skeleton rounded w-32" />
        </div>
        <div className="h-6 skeleton rounded-full w-16" />
      </div>
      <div className="h-8 skeleton rounded-lg" />
      <div className="grid grid-cols-4 gap-3">
        {[0,1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
      </div>
    </div>
  )
}
