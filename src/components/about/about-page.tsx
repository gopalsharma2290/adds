'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/app-store'
import { FlaskConical, Users, Target, BookOpen, Code2, BarChart3, Layers, ArrowUpDown, Sparkles } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

export function AboutPage() {
  const { setCurrentPage } = useAppStore()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-6 pt-16 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-1/3 w-[500px] h-[500px] rounded-full bg-lavender/[0.03] blur-[120px]"
          />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <button
              onClick={() => setCurrentPage('home')}
              className="text-xs text-muted-foreground hover:text-cream transition-colors mb-6"
            >
              ← Back to Home
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-lavender/10 flex items-center justify-center text-lavender">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-cream">About This Project</h1>
                <p className="text-sm text-muted-foreground">ADDS Interactive Experiment Lab</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8"
          >
            <p className="text-lg text-cream/80 leading-relaxed mb-6">
              The <span className="text-lavender font-semibold">ADDS Interactive Experiment Lab</span> is a 
              comprehensive educational platform designed to make algorithms and data structures come alive 
              through real-time visualization, interactive simulations, and live Python execution.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built with a focus on conceptual clarity, every animation and interaction is designed to teach — 
              not just demonstrate. Users can see algorithms think, watch data transform, and understand 
              the internal logic of operations step by step.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Project Architecture */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-cream mb-8">
              Architecture & Technology
            </motion.h2>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: <Code2 className="w-5 h-5" />, title: 'Next.js 16 App Router', desc: 'Server-side rendering, file-based routing, and React 19 with the latest App Router architecture.' },
                { icon: <Sparkles className="w-5 h-5" />, title: 'Framer Motion', desc: 'Physics-based animations, layout transitions, and cinematic scroll-driven motion design.' },
                { icon: <BarChart3 className="w-5 h-5" />, title: 'Recharts', desc: 'Declarative charting library for animated bar charts, tooltips, and responsive data visualization.' },
                { icon: <Layers className="w-5 h-5" />, title: 'Pyodide', desc: 'CPython compiled to WebAssembly, enabling full Python execution with pandas/numpy directly in the browser.' },
                { icon: <ArrowUpDown className="w-5 h-5" />, title: 'Monaco Editor', desc: 'VS Code-grade code editing experience with syntax highlighting, auto-completion, and Python support.' },
                { icon: <Target className="w-5 h-5" />, title: 'Zustand State', desc: 'Lightweight, scalable state management for navigation, sorting state, and stack operations.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="p-5 rounded-xl glass hover:border-white/10 transition-all duration-300"
                >
                  <div className="text-lavender/60 mb-3">{item.icon}</div>
                  <h3 className="text-sm font-semibold text-cream mb-1.5">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl glass p-8"
          >
            <h2 className="text-2xl font-bold text-cream mb-6">Design Philosophy</h2>
            <div className="space-y-4">
              {[
                { title: 'Education First', desc: 'Every animation, transition, and visual element exists to teach. Nothing is purely decorative.' },
                { title: 'Cinematic Experience', desc: 'The interface feels like a premium product — dark, immersive, and intentionally crafted.' },
                { title: 'Live Execution', desc: 'Real Python code runs in your browser. No server, no API — just Pyodide-powered computation.' },
                { title: 'Step-by-Step Clarity', desc: 'Every operation is broken down into explainable, visual steps that build understanding progressively.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.03]"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-lavender/10 text-lavender text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cream mb-0.5">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            ADDS Interactive Experiment Lab — Designed for educational excellence and visual learning
          </p>
        </div>
      </footer>
    </div>
  )
}
