import { Bell, Search, Menu } from 'lucide-react'
import { useAlertStore } from '../../store/alertStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function Topbar({ title, breadcrumbs, onMenuClick }) {
  const { alerts } = useAlertStore()
  const criticalCount = alerts.filter(a => a.type === 'critical').length

  return (
    <header className="fixed top-0 left-0 lg:left-60 right-0 h-16 bg-white/90 backdrop-blur-sm border-b border-slate-100 flex items-center px-4 md:px-6 gap-4 z-[100]">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu size={20} />
      </button>
      {/* Breadcrumbs / title */}
      <div className="flex-1 min-w-0">
        {breadcrumbs ? (
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-300">/</span>}
                <span 
                  onClick={() => i === 0 && window.location.assign('/chief')}
                  className={i === breadcrumbs.length - 1 ? 'font-semibold text-slate-800' : 'text-slate-400 hover:text-slate-600 cursor-pointer'}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="font-semibold text-slate-800 text-base truncate">{title}</h1>
        )}
      </div>

      {/* Alert badge */}
      <div className="relative">
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
          <AnimatePresence>
            {criticalCount > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
              >
                {criticalCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  )
}
