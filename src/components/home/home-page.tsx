'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useAppStore, type PageId } from '@/stores/app-store'
import { BarChart3, Layers, ArrowUpDown, ChevronRight, Code2, Cpu, Database, Zap } from 'lucide-react'
import { useRef } from 'react'

const experiments = [
  {
    id: 'experiment-1' as PageId,
    title: 'Data Analysis & Visualization',
    description: 'Transform raw CSV data into meaningful insights using pandas, filtering, grouping, and animated chart visualization.',
    icon: <BarChart3 className="w-6 h-6" />,
    gradient: 'from-lavender/20 to-blue-500/20',
    accent: 'text-lavender',
    border: 'border-lavender/20',
    glow: 'hover:shadow-[0_0_40px_rgba(167,139,250,0.15)]',
  },
  {
    id: 'experiment-2' as PageId,
    title: 'Stack Data Structure',
    description: 'Visualize LIFO operations with animated push/pop, real-time stack memory simulation, and complexity analysis.',
    icon: <Layers className="w-6 h-6" />,
    gradient: 'from-gold/20 to-orange-500/20',
    accent: 'text-gold',
    border: 'border-gold/20',
    glow: 'hover:shadow-[0_0_40px_rgba(212,165,116,0.15)]',
  },
  {
    id: 'experiment-3' as PageId,
    title: 'Bubble Sort Visualization',
    description: 'Watch bubble sort come alive with animated comparisons, fluid swaps, and real-time algorithm analysis.',
    icon: <ArrowUpDown className="w-6 h-6" />,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]',
  },
]

const techStack = [
  { name: 'Next.js 16', icon: <Code2 className="w-5 h-5" />, desc: 'App Router & React 19' },
  { name: 'Pyodide', icon: <Cpu className="w-5 h-5" />, desc: 'Browser Python Runtime' },
  { name: 'Recharts', icon: <BarChart3 className="w-5 h-5" />, desc: 'Data Visualization' },
  { name: 'Framer Motion', icon: <Zap className="w-5 h-5" />, desc: 'Fluid Animations' },
  { name: 'Monaco Editor', icon: <Code2 className="w-5 h-5" />, desc: 'Code Editor' },
  { name: 'TypeScript', icon: <Database className="w-5 h-5" />, desc: 'Type Safety' },
]

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export function HomePage() {
  const { setCurrentPage } = useAppStore()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95])

  return (
    <div className="relative">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen overflow-hidden bg-stone-200"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2400&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-900/10 to-slate-950/60" />
        <div
          className="absolute inset-0 opacity-35 mix-blend-soft-light"
          style={{
            backgroundImage: 'linear-gradient(105deg, rgba(255,255,255,0.34) 0 32%, transparent 32% 68%, rgba(255,255,255,0.22) 68% 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.34),transparent_28%),radial-gradient(circle_at_82%_68%,rgba(52,211,153,0.22),transparent_26%)]" />

        {/* Content */}
        <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-8 pt-28 md:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-none absolute left-4 right-4 top-[11%] text-[27vw] font-black leading-[0.72] tracking-[-0.08em] text-[#fff8ea] md:left-6 md:right-6 md:top-[8%]"
          >
            ADDS
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="max-w-[740px] text-[clamp(3.6rem,8vw,8rem)] font-black leading-[0.84] tracking-[-0.065em] text-white">
                visualize<br />the workflow
              </p>
              <div className="mt-5 flex gap-24" aria-hidden="true">
                <span className="h-16 w-16 bg-lavender" />
                <span className="hidden h-16 w-16 bg-emerald-400 md:block" />
                <span className="hidden h-16 w-16 bg-gold lg:block" />
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('experiment-1')}
              className="mb-2 w-fit rounded-full bg-[#fff8ea] px-8 py-4 text-sm font-black text-slate-950 shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-transform hover:scale-105"
            >
              start analysis
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Experiment Cards Section */}
      <section id="experiments-section" className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] text-lavender/60 mb-4">
              Experiments
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-slate-950 mb-4">
              Interactive Laboratories
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-xl mx-auto">
              Three carefully crafted experiments that bring algorithms and data structures to life through 
              real-time visualization and Python execution.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {experiments.map((exp) => (
              <motion.div
                key={exp.id}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                onClick={() => setCurrentPage(exp.id)}
                className={`group relative p-6 rounded-2xl glass cursor-pointer transition-all duration-500 ${exp.glow} hover:border-slate-200`}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${exp.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${exp.gradient} ${exp.accent} mb-4`}>
                    {exp.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950 mb-2">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{exp.description}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-lavender/70 group-hover:text-lavender transition-colors">
                    <span>Launch Experiment</span>
                    <motion.span
                      className="inline-block"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                    >
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.3em] text-gold/60 mb-4">
              Technology
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-slate-950 mb-4">
              Built With Precision
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-xl mx-auto">
              A modern technology stack designed for performance, interactivity, and educational excellence.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {techStack.map((tech) => (
              <motion.div
                key={tech.name}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="group p-4 rounded-xl glass text-center hover:border-slate-200 transition-all duration-300"
              >
                <div className="text-lavender/60 group-hover:text-lavender transition-colors mb-3 flex justify-center">
                  {tech.icon}
                </div>
                <p className="text-sm font-medium text-slate-950">{tech.name}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{tech.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Learning Objectives */}
      <section className="relative px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-lavender/60 mb-4">
              Learning Outcomes
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-950 mb-8">
              What You Will Master
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              { title: 'Data Pipeline Understanding', desc: 'Learn how raw data transforms through cleaning, filtering, and aggregation into visual insights.' },
              { title: 'Stack Operations Internals', desc: 'Visualize LIFO behavior, understand push/pop mechanics, and analyze time complexity.' },
              { title: 'Sorting Algorithm Mechanics', desc: 'See exactly how bubble sort compares and swaps elements, and understand its limitations.' },
              { title: 'Python Execution', desc: 'Write and execute real Python code in the browser using Pyodide with instant visual feedback.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-xl glass hover:border-slate-200 transition-all duration-300"
              >
                <h3 className="text-sm font-semibold text-slate-950 mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            ADDS Interactive Experiment Lab — Built for educational excellence
          </p>
          <p className="text-xs text-muted-foreground/50">
            Next.js 16 · Pyodide · Framer Motion · Recharts
          </p>
        </div>
      </footer>
    </div>
  )
}
