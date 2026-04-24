import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, AlertOctagon, AlertTriangle, CheckCircle, TrendingUp, Stethoscope, UserCheck, Activity } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PatientCard from '../../components/patients/PatientCard'
import SkeletonCard from '../../components/patients/SkeletonCard'
import { patientApi, userApi } from '../../api/services'
import SidePanel from '../../components/ui/SidePanel'
import PatientDetail from '../shared/PatientDetail'
import FAB from '../../components/ui/FAB'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { User } from 'lucide-react'

import { BorderRotate } from '../../components/ui/animated-gradient-border'

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <BorderRotate 
    borderRadius={20} 
    borderWidth={1.5} 
    animationSpeed={8}
    className="h-full"
  >
    <motion.div
      whileHover={{ y: -2 }}
      className="stat-card h-full bg-white/60 backdrop-blur-md"
    >
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="text-xs text-slate-400">{sub}</span>
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-800">{value ?? '—'}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
    </motion.div>
  </BorderRotate>
)

export default function ChiefDashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState(null)

  const { data: patientsData, isLoading: pLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientApi.getAll().then(r => r.data),
    refetchInterval: 20000,
  })
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: () => patientApi.getStats().then(r => r.data),
    refetchInterval: 10000,
  })
  const { data: staffData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll().then(r => r.data),
  })

  const patients = patientsData?.patients || []
  const staff = staffData?.users || []
  const doctors = staff.filter(u => u.role === 'doctor')
  const nurses = staff.filter(u => u.role === 'nurse')

  const criticalPatients = patients.filter(p => p.status === 'critical')
  const moderatePatients = patients.filter(p => p.status === 'moderate')
  const stablePatients = patients.filter(p => p.status === 'stable')

  const location = useLocation()
  const isPatientsView = location.pathname.includes('/patients')
  const isStaffView = location.pathname.includes('/staff')

  return (
    <DashboardLayout 
      title={isPatientsView ? "Chief Doctor — All Patients" : isStaffView ? "Chief Doctor — Staff Directory" : "Chief Doctor — Overview"} 
      breadcrumbs={['Hospital', isPatientsView ? 'Patients' : isStaffView ? 'Staff' : 'Overview']}
    >
      {/* Overview View */}
      {!isPatientsView && !isStaffView && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Patients" value={statsData?.total} icon={Users} color="bg-primary-600" sub="Active" />
            <StatCard label="Critical" value={statsData?.critical} icon={AlertOctagon} color="bg-red-500" sub="Urgent" />
            <StatCard label="Moderate" value={statsData?.moderate} icon={AlertTriangle} color="bg-orange-500" sub="Watch" />
            <StatCard label="Stable" value={statsData?.stable} icon={CheckCircle} color="bg-green-500" sub="Recovering" />
          </div>

          {/* Critical patients first */}
          {criticalPatients.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertOctagon size={16} className="text-red-500" />
                <h2 className="font-semibold text-slate-800">Critical Patients</h2>
                <span className="badge-critical ml-1">{criticalPatients.length}</span>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {criticalPatients.map((p, i) => (
                  <PatientCard key={p._id} patient={p} index={i} onClick={(patient) => setSelectedPatientId(patient._id)} />
                ))}
              </div>
            </section>
          )}

          {/* Simple Staff Preview */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <BorderRotate borderRadius={20} borderWidth={1} animationSpeed={12}>
              <div className="glass-card p-5 h-full bg-white/60 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope size={16} className="text-primary-600" />
                  <h2 className="font-semibold text-slate-700 text-sm">Doctors</h2>
                  <span className="ml-auto text-xs text-slate-400">{doctors.length} active</span>
                </div>
                <p className="text-xs text-slate-500">Quickly monitor on-duty medical staff and assignments.</p>
              </div>
            </BorderRotate>
            <BorderRotate borderRadius={20} borderWidth={1} animationSpeed={15}>
              <div className="glass-card p-5 h-full bg-white/60 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck size={16} className="text-emerald-600" />
                  <h2 className="font-semibold text-slate-700 text-sm">Nurses</h2>
                  <span className="ml-auto text-xs text-slate-400">{nurses.length} active</span>
                </div>
                <p className="text-xs text-slate-500">Coordinate nursing shifts and patient care tasks.</p>
              </div>
            </BorderRotate>
          </div>
        </>
      )}

      {/* Patients View */}
      {isPatientsView && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-primary-600" />
              <h2 className="text-xl font-bold text-slate-800">Patient Directory</h2>
            </div>
            <div className="flex gap-2">
              <span className="badge-critical">Critical: {criticalPatients.length}</span>
              <span className="badge-stable">Stable: {stablePatients.length}</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {patients.map((p, i) => (
              <PatientCard key={p._id} patient={p} index={i} onClick={(patient) => setSelectedPatientId(patient._id)} />
            ))}
          </div>
        </section>
      )}

      {/* Staff View */}
      {isStaffView && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Stethoscope size={20} className="text-primary-600" />
            <h2 className="text-xl font-bold text-slate-800">Medical Staff</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map(member => (
              <BorderRotate key={member._id} borderRadius={20} borderWidth={1} animationSpeed={20}>
                <div className="glass-card p-5 h-full bg-white/60 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${member.role === 'doctor' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center`}>
                      <User size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{member.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{member.role.replace('_', ' ')}</p>
                    </div>
                    <span className="ml-auto w-2.5 h-2.5 bg-green-500 rounded-full" />
                  </div>
                </div>
              </BorderRotate>
            ))}
          </div>
        </section>
      )}

      {pLoading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0,1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Floating Action Button */}
      <FAB tooltip="Assign Duties" onClick={() => toast.success('Duty assignment panel opened')} />

      {/* Side Panel for Patient Details */}
      <SidePanel 
        isOpen={!!selectedPatientId} 
        onClose={() => setSelectedPatientId(null)}
        title="Patient Details"
      >
        {selectedPatientId && (
          <PatientDetail role="chief" patientId={selectedPatientId} isModal={true} />
        )}
      </SidePanel>
    </DashboardLayout>
  )
}
