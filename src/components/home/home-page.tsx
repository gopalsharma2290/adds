'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useAppStore, type PageId } from '@/stores/app-store'
import { Soft3DIcon } from '@/components/ui/soft-3d-icon'
import { useRef } from 'react'

const experiments = [
  {
    id: 'experiment-1' as PageId,
    title: 'Data Analysis & Visualization',
    description: 'Transform raw CSV data into meaningful insights using pandas, filtering, grouping, and animated chart visualization.',
    icon: 'data' as const,
    gradient: 'from-lavender/20 to-blue-500/20',
    accent: 'text-lavender',
    border: 'border-lavender/20',
    glow: 'hover:shadow-[0_0_40px_rgba(167,139,250,0.15)]',
  },
  {
    id: 'experiment-2' as PageId,
    title: 'Stack Data Structure',
    description: 'Visualize LIFO operations with animated push/pop, real-time stack memory simulation, and complexity analysis.',
    icon: 'stack' as const,
    gradient: 'from-gold/20 to-orange-500/20',
    accent: 'text-gold',
    border: 'border-gold/20',
    glow: 'hover:shadow-[0_0_40px_rgba(212,165,116,0.15)]',
  },
  {
    id: 'experiment-3' as PageId,
    title: 'Bubble Sort Visualization',
    description: 'Watch bubble sort come alive with animated comparisons, fluid swaps, and real-time algorithm analysis.',
    icon: 'sort' as const,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]',
  },
]

const techStack = [
  { name: 'Next.js 16', icon: 'code' as const, desc: 'App Router & React 19' },
  { name: 'Pyodide', icon: 'python' as const, desc: 'Browser Python Runtime' },
  { name: 'Recharts', icon: 'chart' as const, desc: 'Data Visualization' },
  { name: 'Framer Motion', icon: 'motion' as const, desc: 'Fluid Animations' },
  { name: 'Monaco Editor', icon: 'code' as const, desc: 'Code Editor' },
  { name: 'TypeScript', icon: 'type' as const, desc: 'Type Safety' },
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
        className="relative min-h-screen overflow-hidden bg-[#f4eee6]"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #f6efe7 0%, #efd8cd 28%, #dce6dc 58%, #d9e3ef 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'linear-gradient(110deg, rgba(255,248,234,0.92) 0 19%, transparent 19% 44%, rgba(228,214,202,0.72) 44% 68%, transparent 68% 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.45),transparent_24%),radial-gradient(circle_at_83%_72%,rgba(185,203,221,0.38),transparent_26%),radial-gradient(circle_at_52%_48%,rgba(234,219,207,0.42),transparent_34%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f7f3ee] via-[#f7f3ee]/65 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex min-h-[680px] flex-col justify-end px-4 pb-8 pt-24 sm:min-h-screen sm:px-6 md:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-none absolute left-4 right-4 top-24 text-[5.8rem] font-black leading-none text-slate-950/10 sm:top-20 sm:text-[8.5rem] md:left-6 md:right-6 md:top-16 md:text-[12rem] lg:text-[16rem] xl:text-[19rem]"
          >
            ADDS
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div className="min-w-0">
              <p className="max-w-[760px] text-5xl font-black leading-[0.95] text-slate-950 sm:text-6xl md:text-7xl lg:text-8xl">
                visualize<br />the workflow
              </p>
              <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-slate-700 sm:text-base">
                Interactive data, stack, and sorting experiments built for clear hands-on learning.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('experiment-1')}
              className="mb-2 w-full rounded-full bg-slate-950 px-8 py-4 text-sm font-black text-white shadow-[0_12px_40px_rgba(15,23,42,0.18)] transition-transform hover:scale-105 sm:w-fit"
            >
              start analysis
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Experiment Cards Section */}
      <section id="experiments-section" className="relative px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="mb-10 text-center sm:mb-16"
          >
            <motion.p variants={fadeInUp} className="mb-4 text-xs uppercase text-lavender/60">
              Experiments
            </motion.p>
            <motion.h2 variants={fadeInUp} className="mb-4 text-3xl font-bold text-slate-950 sm:text-4xl md:text-5xl">
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
            className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
          >
            {experiments.map((exp) => (
              <motion.div
                key={exp.id}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                onClick={() => setCurrentPage(exp.id)}
                className={`group relative cursor-pointer rounded-2xl p-5 transition-all duration-500 glass sm:p-6 ${exp.glow} hover:border-slate-200`}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${exp.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <Soft3DIcon variant={exp.icon} size="md" className="mb-4" />
                  <h3 className="text-lg font-semibold text-slate-950 mb-2">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{exp.description}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-lavender/70 group-hover:text-lavender transition-colors">
                    <span>Launch Experiment</span>
                    <motion.span className="inline-block text-base" initial={{ x: 0 }} whileHover={{ x: 4 }}>
                      →
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="mb-10 text-center sm:mb-16"
          >
            <motion.p variants={fadeInUp} className="mb-4 text-xs uppercase text-gold/60">
              Technology
            </motion.p>
            <motion.h2 variants={fadeInUp} className="mb-4 text-3xl font-bold text-slate-950 sm:text-4xl md:text-5xl">
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
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
          >
            {techStack.map((tech) => (
              <motion.div
                key={tech.name}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="group p-4 rounded-xl glass text-center hover:border-slate-200 transition-all duration-300"
              >
                <div className="mb-4 flex justify-center">
                  <Soft3DIcon variant={tech.icon} size="sm" />
                </div>
                <p className="text-sm font-medium text-slate-950">{tech.name}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{tech.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Learning Objectives */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-4 text-xs uppercase text-lavender/60">
              Learning Outcomes
            </p>
            <h2 className="mb-8 text-3xl font-bold text-slate-950 sm:text-4xl md:text-5xl">
              What You Will Master
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
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
      <footer className="border-t border-slate-200 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
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
