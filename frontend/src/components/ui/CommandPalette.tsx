import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Stethoscope, Command, AlertCircle, Activity, PlaneTakeoff, Heart, FileText } from 'lucide-react'
import { ActionSearchBar, Action } from './action-search-bar'
import toast from 'react-hot-toast'

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const hospitalActions: Action[] = [
    {
      id: "emergency",
      label: "Trigger Emergency SOS",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      description: "Critical Protocol",
      short: "⌘E",
      end: "Emergency",
    },
    {
      id: "vitals",
      label: "Monitor Patient Vitals",
      icon: <Activity className="h-4 w-4 text-primary-500" />,
      description: "Real-time feed",
      short: "⌘V",
      end: "Medical",
    },
    {
      id: "search",
      label: "Search Patient Records",
      icon: <Search className="h-4 w-4 text-blue-500" />,
      description: "All database",
      short: "⌘F",
      end: "Data",
    },
    {
      id: "duty",
      label: "Assign Duty Roster",
      icon: <Stethoscope className="h-4 w-4 text-emerald-500" />,
      description: "Staff management",
      short: "⌘D",
      end: "Chief",
    },
    {
      id: "discharge",
      label: "Process Discharge",
      icon: <FileText className="h-4 w-4 text-slate-500" />,
      description: "Documentation",
      short: "",
      end: "Admin",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-transparent overflow-hidden"
          >
            <ActionSearchBar 
              actions={hospitalActions} 
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
