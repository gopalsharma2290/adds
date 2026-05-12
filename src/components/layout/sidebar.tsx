'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type PageId } from '@/stores/app-store'
import {
  Home,
  BarChart3,
  Layers,
  ArrowUpDown,
  Info,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
} from 'lucide-react'

const navItems: { id: PageId; label: string; icon: React.ReactNode; section?: string }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { id: 'experiment-1', label: 'Data Analysis', icon: <BarChart3 className="w-4 h-4" />, section: 'Experiments' },
  { id: 'experiment-2', label: 'Stack', icon: <Layers className="w-4 h-4" />, section: 'Experiments' },
  { id: 'experiment-3', label: 'Bubble Sort', icon: <ArrowUpDown className="w-4 h-4" />, section: 'Experiments' },
]

export function Sidebar() {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-[#0d1130]/90 backdrop-blur-xl border-r border-white/[0.04]"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.04]">
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-lavender to-lavender-glow flex items-center justify-center"
        >
          <FlaskConical className="w-4 h-4 text-navy" />
        </motion.div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-semibold text-cream whitespace-nowrap"
            >
              ADDS Lab
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {navItems.map((item, index) => (
          <div key={item.id}>
            {item.section && index === 1 && !sidebarCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 px-3 mb-2 mt-4"
              >
                Experiments
              </motion.p>
            )}
            <motion.button
              onClick={() => setCurrentPage(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 mb-0.5
                ${currentPage === item.id
                  ? 'bg-lavender/10 text-lavender glow-lavender'
                  : 'text-muted-foreground hover:text-cream hover:bg-white/[0.03]'
                }
              `}
            >
              <span className={`flex-shrink-0 transition-colors duration-200 ${currentPage === item.id ? 'text-lavender' : ''}`}>
                {item.icon}
              </span>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {currentPage === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-[2px] h-6 bg-lavender rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          </div>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="p-2 border-t border-white/[0.04]">
        <motion.button
          onClick={toggleSidebar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:text-cream hover:bg-white/[0.03] transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </div>
    </motion.aside>
  )
}
