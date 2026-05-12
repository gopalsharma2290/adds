'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useAppStore, type PageId } from '@/stores/app-store'
import { BarChart3, Layers, ArrowUpDown, ChevronRight, Sparkles, Code2, Cpu, Database, Zap, ArrowDown } from 'lucide-react'
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
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      >
        {/* Animated background orbs with parallax — each wrapper moves at a different scroll speed */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary lavender orb — top left */}
          <motion.div style={{ y: orb1Y }} className="absolute top-1/4 left-1/4">
            <motion.div
              animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-[500px] h-[500px] rounded-full bg-lavender/[0.06] blur-[100px]"
            />
          </motion.div>
          {/* Lavender-glow orb — bottom right */}
          <motion.div style={{ y: orb2Y }} className="absolute bottom-1/3 right-1/4">
            <motion.div
              animate={{ x: [0, -40, 30, 0], y: [0, 20, -30, 0], scale: [1, 0.9, 1.1, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="w-[400px] h-[400px] rounded-full bg-lavender-glow/[0.05] blur-[80px]"
            />
          </motion.div>
          {/* Gold orb — top right */}
          <motion.div style={{ y: orb3Y }} className="absolute top-1/2 right-1/3">
            <motion.div
              animate={{ x: [0, 20, -30, 0], y: [0, 30, -20, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="w-[300px] h-[300px] rounded-full bg-gold/[0.05] blur-[80px]"
            />
          </motion.div>
          {/* Deep lavender orb — center left */}
          <motion.div style={{ y: orb4Y }} className="absolute top-1/3 left-[10%]">
            <motion.div
              animate={{ x: [0, -25, 35, 0], y: [0, 40, -25, 0], scale: [1, 1.15, 0.9, 1] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="w-[350px] h-[350px] rounded-full bg-lavender/[0.04] blur-[120px]"
            />
          </motion.div>
          {/* Gold accent orb — bottom left */}
          <motion.div style={{ y: orb5Y }} className="absolute bottom-1/4 left-1/3">
            <motion.div
              animate={{ x: [0, 35, -15, 0], y: [0, -20, 30, 0], scale: [1, 0.95, 1.1, 1] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="w-[250px] h-[250px] rounded-full bg-gold/[0.04] blur-[90px]"
            />
          </motion.div>
          {/* Large ambient center orb */}
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              className="w-[700px] h-[700px] rounded-full bg-lavender/[0.025] blur-[150px]"
            />
          </motion.div>
        </div>

        {/* Animated pulsing grid overlay */}
        <motion.div
          animate={{ opacity: [0.015, 0.04, 0.015] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(167,139,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Cinematic vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 0%, rgba(248,250,252,0.9) 78%)' }}
        />

        {/* Floating code / algorithm symbols */}
        {codeSymbols.map((item, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.12, 0.06, 0.12, 0],
              y: [0, -25, -10, -25, 0],
              x: [0, 8, -4, 8, 0],
              rotate: [0, 3, -2, 3, 0],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
            className="absolute text-lavender/10 font-mono text-lg select-none pointer-events-none"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.symbol}
          </motion.span>
        ))}

        {/* Subtle particle / dot effect */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -15, 0],
              opacity: [0.15, 0.45, 0.15],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
            }}
            className="absolute rounded-full bg-lavender/25 pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="mb-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-lavender/80 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Algorithm Laboratory</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
          >
            <span className="text-slate-950">Visualize</span>
            <br />
            <span className="shimmer-text inline-block bg-gradient-to-r from-lavender via-lavender-glow to-gold bg-clip-text text-transparent">
              Logic.
            </span>{' '}
            <span className="text-slate-700">Experience</span>
            <br />
            <span className="shimmer-text inline-block bg-gradient-to-r from-gold via-lavender-glow to-lavender bg-clip-text text-transparent">
              Algorithms.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Real-time visualization of data structures, algorithms, and data analysis 
            using Python — an immersive educational laboratory.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => setCurrentPage('experiment-1')}
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(167,139,250,0.4), 0 0 100px rgba(167,139,250,0.15)' }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-lavender to-lavender-glow text-white font-semibold text-sm tracking-wide glow-lavender transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Start Exploring</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gold/80 to-lavender-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>
            <motion.button
              onClick={() => {
                const element = document.getElementById('experiments-section')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(167,139,250,0.15), inset 0 0 30px rgba(167,139,250,0.05)' }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-8 py-3.5 rounded-xl glass text-slate-700 font-medium text-sm tracking-wide hover:text-slate-950 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Learn More</span>
              <div className="absolute inset-0 bg-lavender/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-muted-foreground/40"
          >
            <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
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
