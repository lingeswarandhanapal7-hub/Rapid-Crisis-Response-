import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X, AlertOctagon, Bell } from 'lucide-react'
import { useAlertStore } from '../../store/alertStore'

const iconMap = {
  critical: { Icon: AlertOctagon, bg: 'bg-red-50 border-red-200', icon: 'text-red-600', bar: 'bg-red-500' },
  warning: { Icon: AlertTriangle, bg: 'bg-orange-50 border-orange-200', icon: 'text-orange-600', bar: 'bg-orange-500' },
  info: { Icon: Bell, bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-600', bar: 'bg-blue-500' },
}

export default function AlertPanel() {
  const { alerts, removeAlert, clearAll } = useAlertStore()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => {
          const style = iconMap[alert.type] || iconMap.info
          const { Icon } = style
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className={`relative overflow-hidden rounded-xl border shadow-lg ${style.bg}`}
            >
              {/* Progress bar */}
              <motion.div
                className={`absolute top-0 left-0 h-0.5 ${style.bar}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 8, ease: 'linear' }}
              />
              <div className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 shrink-0 ${style.icon}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{alert.message}</p>
                  {alert.patient && (
                    <p className="text-xs text-slate-500 mt-0.5">Patient: {alert.patient.name}</p>
                  )}
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
