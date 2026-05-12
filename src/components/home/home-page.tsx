'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useAppStore, type PageId } from '@/stores/app-store'
import { BarChart3, Layers, ArrowUpDown, ChevronRight, Code2, Cpu, Database, Zap, Search, User, ShoppingBag, ChevronDown } from 'lucide-react'
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

const codeSymbols = [
  { symbol: '{ }', x: 8, y: 15, delay: 0, duration: 25 },
  { symbol: '[ ]', x: 82, y: 12, delay: 2, duration: 30 },
  { symbol: '=>', x: 12, y: 72, delay: 4, duration: 22 },
  { symbol: '( )', x: 78, y: 68, delay: 1, duration: 28 },
  { symbol: '&&', x: 45, y: 8, delay: 3, duration: 26 },
  { symbol: '||', x: 28, y: 82, delay: 5, duration: 24 },
  { symbol: 'fn', x: 88, y: 42, delay: 2.5, duration: 27 },
  { symbol: '< />', x: 5, y: 48, delay: 1.5, duration: 29 },
  { symbol: '::', x: 65, y: 85, delay: 3.5, duration: 23 },
  { symbol: '++', x: 35, y: 5, delay: 4.5, duration: 31 },
]

const particles = Array.from({ length: 20 }, (_, i) => ({
  x: (i * 37 + 13) % 97,
  y: (i * 53 + 7) % 89,
  size: (i % 3) + 1,
  duration: 15 + (i % 10),
  delay: (i * 0.5) % 5,
}))

export function HomePage() {
  const { setCurrentPage } = useAppStore()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95])

  // Parallax transforms for gradient orbs — each orb moves at a different speed
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, -60])
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -120])
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0, -40])
  const orb4Y = useTransform(scrollYProgress, [0, 1], [0, -180])
  const orb5Y = useTransform(scrollYProgress, [0, 1], [0, -90])

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
            backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=2400&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/35" />
        <div
          className="absolute inset-0 opacity-30 mix-blend-soft-light"
          style={{
            backgroundImage: 'linear-gradient(105deg, rgba(255,255,255,0.38) 0 32%, transparent 32% 68%, rgba(255,255,255,0.28) 68% 100%)',
          }}
        />

        <div className="absolute left-0 right-0 top-0 z-20 h-9 overflow-hidden bg-[#171615] text-[#f7f1e6]">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
            className="flex h-full w-max items-center gap-10 whitespace-nowrap text-[13px] font-semibold"
          >
            {Array.from({ length: 2 }).map((_, groupIndex) => (
              <div key={groupIndex} className="flex items-center gap-10">
                <span>run code in the browser</span>
                <span>•</span>
                <span>visualize every step</span>
                <span>•</span>
                <span>compare algorithms live</span>
                <span>•</span>
                <span>learn data structures by doing</span>
                <span>•</span>
              </div>
            ))}
          </motion.div>
        </div>

        <nav className="absolute left-0 right-0 top-9 z-20 flex h-20 items-center justify-center px-6 text-[#fff8ea]">
          <div className="absolute left-7 text-sm font-black tracking-tight">ADDS Lab</div>
          <div className="hidden items-center gap-9 text-sm font-bold md:flex">
            <button onClick={() => setCurrentPage('experiment-1')} className="flex items-center gap-1">
              analyze <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setCurrentPage('experiment-2')} className="flex items-center gap-1">
              structures <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setCurrentPage('experiment-3')}>sorting</button>
          </div>
          <div className="absolute right-6 flex items-center gap-2">
            {[Search, User, ShoppingBag].map((Icon, index) => (
              <button
                key={index}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur-md transition-colors hover:bg-white/28"
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pb-8 pt-32 md:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-none absolute left-4 right-4 top-[10%] text-[28vw] font-black leading-[0.72] tracking-[-0.08em] text-[#fff8ea] md:left-6 md:right-6 md:top-[8%]"
          >
            adds
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="max-w-[740px] text-[clamp(3.6rem,8vw,8rem)] font-black leading-[0.84] tracking-[-0.065em] text-white">
                the right<br />amount of logic
              </p>
              <div className="mt-5 flex gap-24">
                <span className="h-16 w-16 bg-[#e65f51]" />
                <span className="hidden h-16 w-16 bg-[#e65f51] md:block" />
                <span className="hidden h-16 w-16 bg-[#e65f51] lg:block" />
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('experiment-1')}
              className="mb-2 w-fit rounded-full bg-[#fff8ea] px-8 py-4 text-sm font-black text-[#171615] shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-transform hover:scale-105"
            >
              start now
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
