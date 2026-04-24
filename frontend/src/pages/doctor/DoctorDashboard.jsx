import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, AlertOctagon, AlertTriangle, CheckCircle, Stethoscope, LayoutGrid } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PatientCard from '../../components/patients/PatientCard'
import SkeletonCard from '../../components/patients/SkeletonCard'
import SidePanel from '../../components/ui/SidePanel'
import SegmentedControl from '../../components/ui/SegmentedControl'
import FAB from '../../components/ui/FAB'
import PatientDetail from '../shared/PatientDetail'
import { patientApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const [filter, setFilter] = useState('all')
  const [selectedPatientId, setSelectedPatientId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientApi.getAll().then(r => r.data),
    refetchInterval: 15000,
  })

  const patients = data?.patients || []
  const filteredPatients = filter === 'all' ? patients : patients.filter(p => p.status === filter)
  
  const critical = patients.filter(p => p.status === 'critical')
  const moderate = patients.filter(p => p.status === 'moderate')
  const stable = patients.filter(p => p.status === 'stable')

  const filterOptions = [
    { label: 'All Patients', value: 'all', icon: LayoutGrid, activeColor: 'text-primary-600' },
    { label: 'Critical', value: 'critical', icon: AlertOctagon, activeColor: 'text-red-500' },
    { label: 'Moderate', value: 'moderate', icon: AlertTriangle, activeColor: 'text-orange-500' },
    { label: 'Stable', value: 'stable', icon: CheckCircle, activeColor: 'text-green-500' },
  ]

  return (
    <DashboardLayout title={`Dr. ${user?.name?.split(' ').pop()} — Dashboard`} breadcrumbs={['Dashboard', 'My Patients']}>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6 bg-gradient-to-r from-primary-600 to-indigo-600 text-white border-0 shadow-lg relative overflow-hidden"
      >
        <motion.div 
          animate={{ x: [0, 10, 0], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[-5%] top-[-20%] w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" 
        />
        
        <h2 className="text-xl font-bold">Good {getGreeting()}, Dr. {user?.name?.split(' ')[1] || user?.name}! 👋</h2>
        <p className="text-blue-100 text-sm mt-1">{user?.specialization} · {patients.length} patients assigned</p>
        <div className="flex gap-4 mt-5">
          <span className="flex items-center gap-1.5 text-sm bg-white/20 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-white/10">
            <AlertOctagon size={14} className="text-red-200" /> {critical.length} Critical
          </span>
          <span className="flex items-center gap-1.5 text-sm bg-white/20 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-white/10">
            <AlertTriangle size={14} className="text-orange-200" /> {moderate.length} Moderate
          </span>
          <span className="flex items-center gap-1.5 text-sm bg-white/20 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-white/10">
            <CheckCircle size={14} className="text-green-200" /> {stable.length} Stable
          </span>
        </div>
      </motion.div>

      <div className="flex items-center justify-between mb-6">
        <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0,1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && patients.length === 0 && (
        <div className="glass-card p-16 text-center">
          <Stethoscope size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium text-lg">No patients assigned yet</p>
          <p className="text-slate-400 text-sm mt-1">The chief doctor will assign patients to you.</p>
        </div>
      )}

      <motion.div layout className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredPatients.map((p, i) => (
            <PatientCard 
              key={p._id} 
              patient={p} 
              index={i} 
              onClick={(patient) => setSelectedPatientId(patient._id)} 
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Floating Action Button */}
      <FAB tooltip="New Note" onClick={() => console.log('New Note clicked')} />

      {/* Side Panel for Patient Details */}
      <SidePanel 
        isOpen={!!selectedPatientId} 
        onClose={() => setSelectedPatientId(null)}
        title="Patient Details"
      >
        {selectedPatientId && (
          <PatientDetail role="doctor" patientId={selectedPatientId} isModal={true} />
        )}
      </SidePanel>
    </DashboardLayout>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
