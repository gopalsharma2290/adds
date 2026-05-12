'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type PageId } from '@/stores/app-store'
import {
  Home,
  BarChart3,
  Layers,
  ArrowUpDown,
  FlaskConical,
  Menu,
  X,
} from 'lucide-react'

const navItems: { id: PageId; label: string; icon: React.ReactNode; section?: string }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { id: 'experiment-1', label: 'Data Analysis', icon: <BarChart3 className="w-4 h-4" />, section: 'Experiments' },
  { id: 'experiment-2', label: 'Stack', icon: <Layers className="w-4 h-4" />, section: 'Experiments' },
  { id: 'experiment-3', label: 'Bubble Sort', icon: <ArrowUpDown className="w-4 h-4" />, section: 'Experiments' },
]

export function Sidebar() {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useAppStore()
  const menuOpen = !sidebarCollapsed

  const navigateTo = (page: PageId) => {
    setCurrentPage(page)
    setSidebarCollapsed(true)
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={toggleSidebar}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed left-4 top-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/80 bg-white/85 text-slate-950 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors hover:bg-white"
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.button>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation overlay"
              onClick={() => setSidebarCollapsed(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-slate-950/20 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ opacity: 0, x: -24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-4 top-20 z-[65] flex w-[min(320px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
            >
              <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lavender to-lavender-glow">
                  <FlaskConical className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">ADDS Lab</p>
                  <p className="text-xs text-muted-foreground">Interactive experiments</p>
                </div>
              </div>

              <nav className="p-2">
                {navItems.map((item, index) => (
                  <div key={item.id}>
                    {item.section && index === 1 && (
                      <p className="px-3 pb-2 pt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                        Experiments
                      </p>
                    )}
                    <motion.button
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200
                        ${currentPage === item.id
                          ? 'bg-lavender/10 text-lavender'
                          : 'text-muted-foreground hover:bg-slate-50 hover:text-slate-950'
                        }
                      `}
                    >
                      <span className={`flex-shrink-0 transition-colors duration-200 ${currentPage === item.id ? 'text-lavender' : ''}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                      {currentPage === item.id && (
                        <motion.div
                          layoutId="activeFloatingIndicator"
                          className="absolute right-3 h-2 w-2 rounded-full bg-lavender"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
