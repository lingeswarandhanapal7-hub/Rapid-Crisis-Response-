import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff, Loader2, Stethoscope, Shield, UserCheck, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/services'
import toast from 'react-hot-toast'
import AnimatedBackground from '../../components/ui/AnimatedBackground'
import { BorderRotate } from '../../components/ui/animated-gradient-border'
const roles = [
  { id: 'chief_doctor', label: 'Chief Doctor', icon: Shield, color: 'from-violet-500 to-primary-600', desc: 'Full system access' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'from-primary-500 to-cyan-500', desc: 'Patient management' },
  { id: 'nurse', label: 'Nurse', icon: UserCheck, color: 'from-emerald-500 to-teal-500', desc: 'Vitals & care' },
  { id: 'patient', label: 'Patient', icon: User, color: 'from-rose-500 to-pink-500', desc: 'Health tracking' },
]

const demoCredentials = {
  chief_doctor: { email: 'chief@hospital.com', password: 'chief123' },
  doctor: { email: 'doctor1@hospital.com', password: 'doctor123' },
  nurse: { email: 'nurse1@hospital.com', password: 'nurse123' },
  patient: { email: 'patient1@hospital.com', password: 'patient123' },
}

const roleRoutes = {
  chief_doctor: '/chief',
  doctor: '/doctor',
  nurse: '/nurse',
  patient: '/patient',
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('chief_doctor')
  const [email, setEmail] = useState('chief@hospital.com')
  const [password, setPassword] = useState('chief123')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId)
    const creds = demoCredentials[roleId]
    setEmail(creds.email)
    setPassword(creds.password)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      login(data.user, data.token)
      toast.success(`Welcome, ${data.user.name}!`)
      navigate(roleRoutes[data.user.role] || '/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-4xl relative z-[100]">
        <BorderRotate
          animationSpeed={4}
          borderWidth={2}
          borderRadius={24}
          gradientColors={{
            primary: '#3b82f6', // primary-500
            secondary: '#6366f1', // indigo-500
            accent: '#8b5cf6', // violet-500
          }}
          backgroundColor="transparent"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-primary-200/30 bg-white"
          >
            {/* Left Panel — Branding */}
            <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-600 p-8 flex flex-col justify-between text-white relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Heart size={22} className="text-white animate-heartbeat" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg leading-tight">MediCare HMS</h1>
                    <p className="text-blue-200 text-xs">Hospital Management System</p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold leading-snug mb-3">Smart healthcare,<br />smarter decisions.</h2>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Real-time patient monitoring, intelligent alerts, and seamless care coordination — all in one platform.
                </p>
              </div>

              {/* Stats */}
              <div className="relative grid grid-cols-2 gap-3">
                {[
                  { label: 'Active Patients', val: '5+' },
                  { label: 'Staff Members', val: '7+' },
                  { label: 'Alerts Tracked', val: 'Live' },
                  { label: 'Uptime', val: '99.9%' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-2xl p-3">
                    <p className="text-xl font-bold">{s.val}</p>
                    <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel — Form */}
            <div className="bg-white p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign in</h2>
              <p className="text-slate-500 text-sm mb-6">Select your role to get started</p>

              {/* Role selector */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {roles.map(({ id, label, icon: Icon, color, desc }) => (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleRoleSelect(id)}
                    className={`relative z-[110] flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                      selectedRole === id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                      <Icon size={14} className="text-white" />
                    </div>
                    <p className={`text-xs font-semibold mt-1 ${selectedRole === id ? 'text-primary-700' : 'text-slate-700'}`}>{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </motion.button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@hospital.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-3 text-base font-semibold rounded-xl mt-2 relative z-[110]"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </form>

              <p className="text-xs text-slate-400 text-center mt-5">
                Demo credentials auto-filled when selecting a role
              </p>
            </div>
          </motion.div>
        </BorderRotate>
      </div>
      <AnimatedBackground />
    </div>
  )
}
