import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Activity, LogOut,
  Stethoscope, Heart, UserCheck, User, AlertTriangle
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navByRole = {
  chief_doctor: [
    { to: '/chief', label: 'Overview', icon: LayoutDashboard },
    { to: '/chief/patients', label: 'All Patients', icon: Users },
    { to: '/chief/staff', label: 'Staff', icon: Stethoscope },
    { to: '/chief/emergency', label: 'Crisis Dashboard', icon: AlertTriangle },
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/patients', label: 'My Patients', icon: Users },
    { to: '/doctor/vitals', label: 'Vitals Monitor', icon: Activity },
  ],
  nurse: [
    { to: '/nurse', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/nurse/patients', label: 'My Patients', icon: UserCheck },
    { to: '/nurse/vitals', label: 'Update Vitals', icon: Heart },
  ],
  patient: [
    { to: '/patient', label: 'My Health', icon: Heart },
    { to: '/patient/history', label: 'History', icon: Activity },
  ],
}

const roleLabels = {
  chief_doctor: 'Chief Doctor',
  doctor: 'Doctor',
  nurse: 'Nurse',
  patient: 'Patient',
}

const roleColors = {
  chief_doctor: 'from-violet-600 to-primary-600',
  doctor: 'from-primary-600 to-cyan-500',
  nurse: 'from-emerald-500 to-teal-500',
  patient: 'from-rose-500 to-pink-500',
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const navItems = navByRole[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[140] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -240 : 0),
          opacity: 1 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-100 flex flex-col z-[150] shadow-sm transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleColors[user?.role]} flex items-center justify-center shadow-sm`}>
            <Heart size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">MediCare HMS</p>
            <p className="text-xs text-slate-400">v1.0</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColors[user?.role]} flex items-center justify-center shrink-0`}>
            <User size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400">{roleLabels[user?.role]}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink 
            key={to} 
            to={to} 
            end 
            onClick={() => {
              console.log(`Navigating to: ${to}`);
              if (onClose) onClose();
            }}
          >
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-slate-100">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="nav-item w-full text-slate-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={17} />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </motion.aside>
    </>
  )
}
