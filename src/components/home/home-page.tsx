'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useAppStore, type PageId } from '@/stores/app-store'
import { BarChart3, Layers, ArrowUpDown, ChevronRight, Code2, Cpu, Database, Zap, CheckCircle2 } from 'lucide-react'
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
        className="relative min-h-screen overflow-hidden bg-[#fbfaf7]"
      >
        <div className="absolute inset-y-0 right-0 hidden w-12 bg-[#95f0bd] lg:block" />
        <div
          className="absolute inset-0 opacity-[0.24]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(6,44,38,0.22) 0.8px, transparent 0.8px)',
            backgroundSize: '14px 14px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-5 pb-8 pt-24 sm:px-8 md:px-10 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="grid flex-1 items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]"
          >
            <div className="relative z-20 min-w-0">
              <div className="mb-8 inline-flex rounded-lg bg-[#d9fee8] px-3 py-2 text-xs font-black uppercase text-[#062c26] shadow-[0_10px_30px_rgba(8,47,34,0.08)] sm:text-sm">
                Algorithms for visual learners
              </div>
              <h1 className="max-w-6xl text-[clamp(4rem,13.5vw,10.5rem)] font-black uppercase leading-[0.78] text-[#062c26]">
                Tackle data<br />structures together
              </h1>
              <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-slate-700 sm:mt-7">
                ADDS Lab turns analysis, stack memory, and sorting behavior into visual workflows you can actually follow.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setCurrentPage('experiment-1')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#062c26] px-7 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(6,44,38,0.18)] transition-transform hover:scale-105"
                >
                  Start analysis
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage('experiment-3')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#062c26]/55 bg-white/60 px-7 py-3.5 text-sm font-black text-[#062c26] backdrop-blur-md transition-transform hover:scale-105"
                >
                  Compare sorting
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[460px] lg:max-w-[520px]">
              <div className="absolute -left-10 top-28 hidden text-center font-mono text-xs uppercase tracking-wide text-slate-500 md:block">
                <span>click to</span>
                <br />
                <span>step through</span>
                <span className="ml-2 text-lg">→</span>
              </div>
              <div className="relative overflow-hidden rounded-[2rem] bg-[#d9fee8] p-5 shadow-[0_28px_80px_rgba(6,44,38,0.14)]">
                <div className="absolute inset-0 opacity-35 mix-blend-multiply [background-image:radial-gradient(rgba(6,44,38,0.22)_0.8px,transparent_0.8px)] [background-size:13px_13px]" />
                <div className="relative rounded-[1.5rem] border border-[#062c26]/15 bg-white/70 p-4 backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-black uppercase text-[#062c26]">Live workspace</p>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#062c26]" />
                      <span className="h-2 w-2 rounded-full bg-lavender" />
                      <span className="h-2 w-2 rounded-full bg-gold" />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-2xl bg-[#f8ff5a] p-4 text-[#062c26]">
                      <div className="mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-xs font-black uppercase">DataFrame filters</span>
                      </div>
                      <div className="flex h-24 items-end gap-2">
                        {[42, 78, 55, 90, 66, 38].map((height, index) => (
                          <span
                            key={index}
                            className="flex-1 rounded-t bg-[#062c26]"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white p-4">
                        <Layers className="mb-3 h-5 w-5 text-gold" />
                        <p className="text-[10px] font-black uppercase text-slate-500">Stack pointer</p>
                        <p className="mt-1 text-3xl font-black text-[#062c26]">0x04</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <ArrowUpDown className="mb-3 h-5 w-5 text-emerald-500" />
                        <p className="text-[10px] font-black uppercase text-slate-500">Sort race</p>
                        <p className="mt-1 text-3xl font-black text-[#062c26]">4x</p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#caa5ff] p-4 text-[#062c26]">
                      <p className="text-xs font-black uppercase">Python runs in your browser</p>
                      <div className="mt-3 h-2 rounded-full bg-white/60">
                        <div className="h-full w-3/4 rounded-full bg-[#062c26]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.6 }}
            className="relative z-20 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {[
              'Visualize pandas-style filtering',
              'See stack memory move',
              'Race four sorting algorithms',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-white/70 px-5 py-4 shadow-[0_12px_34px_rgba(6,44,38,0.07)] backdrop-blur-lg">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#062c26]" />
                <span className="text-sm font-black uppercase text-[#062c26]">{item}</span>
              </div>
            ))}
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
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${exp.gradient} ${exp.accent}`}>
                    {exp.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950 mb-2">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{exp.description}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-lavender/70 group-hover:text-lavender transition-colors">
                    <span>Launch Experiment</span>
                    <motion.span className="inline-block" initial={{ x: 0 }} whileHover={{ x: 4 }}>
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
