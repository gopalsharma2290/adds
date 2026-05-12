'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/stores/app-store'
import { HomePage } from '@/components/home/home-page'
import { Experiment1Page } from '@/components/experiment1/experiment1-page'
import { Experiment2Page } from '@/components/experiment2/experiment2-page'
import { Experiment3Page } from '@/components/experiment3/experiment3-page'

const pageComponents: Record<string, React.ComponentType> = {
  'home': HomePage,
  'experiment-1': Experiment1Page,
  'experiment-2': Experiment2Page,
  'experiment-3': Experiment3Page,
}

export function PageRouter() {
  const { currentPage } = useAppStore()
  const PageComponent = pageComponents[currentPage] || HomePage

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen"
      >
        <PageComponent />
      </motion.div>
    </AnimatePresence>
  )
}
