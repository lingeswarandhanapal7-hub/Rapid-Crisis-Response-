import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function FAB({ onClick, tooltip = "New Action" }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex items-center gap-3">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-slate-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg"
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-fab hover:bg-primary-500 transition-colors"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  )
}
