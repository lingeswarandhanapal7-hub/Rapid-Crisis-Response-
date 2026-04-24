import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Stethoscope, Command } from 'lucide-react'

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

  // Dummy mock results for UI
  const results = [
    { id: 1, type: 'patient', name: 'John Doe', sub: 'Ward A - Critical', icon: User },
    { id: 2, type: 'doctor', name: 'Dr. Smith', sub: 'Cardiology', icon: Stethoscope },
  ].filter(r => r.name.toLowerCase().includes(query.toLowerCase()))

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
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-100">
              <Search className="text-slate-400 mr-3" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Search patients, doctors, or commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-lg"
              />
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs text-slate-500 font-medium">
                <Command size={12} />
                <span>K</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                results.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center px-4 py-3 hover:bg-primary-50 rounded-xl transition-colors text-left group"
                    onClick={() => { setIsOpen(false); /* Navigate or open panel here */ }}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center mr-3 transition-colors">
                      <item.icon size={16} className="text-slate-500 group-hover:text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>No results found for "{query}"</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
