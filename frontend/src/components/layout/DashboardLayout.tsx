import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import AlertPanel from '../alerts/AlertPanel'
import AnimatedBackground from '../ui/AnimatedBackground'
import CommandPalette from '../ui/CommandPalette'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: string[];
}

export default function DashboardLayout({ children, title, breadcrumbs = [] }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-transparent relative">
      <CommandPalette />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Topbar 
        title={title} 
        breadcrumbs={breadcrumbs} 
        onMenuClick={() => setIsSidebarOpen(true)} 
      />
      <main className="lg:ml-60 pt-16 min-h-screen relative z-[50]">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="p-4 md:p-6 relative z-[10]"
        >
          {children}
        </motion.div>
      </main>
      <AlertPanel />
      <AnimatedBackground />
    </div>
  )
}
