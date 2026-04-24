import { motion } from 'framer-motion'

export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit relative z-0">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
            value === option.value ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {value === option.value && (
            <motion.div
              layoutId="segmented-active"
              className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <div className="flex items-center gap-2">
            {option.icon && <option.icon size={14} className={value === option.value ? option.activeColor : ''} />}
            {option.label}
          </div>
        </button>
      ))}
    </div>
  )
}
