'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/app-store'
import { usePyodide } from '@/hooks/use-pyodide'
import { Layers, Play, Plus, Minus, Eye, RotateCcw, Loader2, ArrowDown, ArrowUp, Zap, CheckCircle, BarChart3, BookOpen } from 'lucide-react'

interface StackItem {
  id: number
  value: number
}

interface OperationRecord {
  id: number
  type: 'push' | 'pop' | 'peek'
  value?: number
  timestamp: number
}

const OPS_PLACEHOLDER = '__OPS_PLACEHOLDER__'

function getStackCode(operations: string): string {
  return `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None
    
    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None
    
    def is_empty(self):
        return len(self.items) == 0
    
    def size(self):
        return len(self.items)

# Create stack and demonstrate operations
s = Stack()
${OPS_PLACEHOLDER}

print(f"Stack contents: {s.items}")
print(f"Stack size: {s.size()}")
print(f"Top element: {s.peek()}")
`.replace(OPS_PLACEHOLDER, operations)
}

function getDefaultStackCode(): string {
  return getStackCode('s.push(10)\ns.push(20)\ns.push(30)')
}

import { UsageThoughts } from '@/components/ui/usage-thoughts'

export function Experiment2Page() {
  const { setCurrentPage } = useAppStore()
  const { pyodide, loading: pyodideLoading, runCode, output, isRunning } = usePyodide()
  const [stack, setStack] = useState<StackItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [history, setHistory] = useState<OperationRecord[]>([])
  const [code, setCode] = useState(getDefaultStackCode)
  const [nextId, setNextId] = useState(1)
  const [poppingItem, setPoppingItem] = useState<number | null>(null)
  const [thoughts, setThoughts] = useState<string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const maxVisualCapacity = 8

  const operationStats = useMemo(() => {
    const pushes = history.filter(item => item.type === 'push').length
    const pops = history.filter(item => item.type === 'pop').length
    const peeks = history.filter(item => item.type === 'peek').length
    return { pushes, pops, peeks, total: history.length }
  }, [history])

  const pushOp = useCallback(() => {
    const values = inputValue.split(',').map(value => parseInt(value.trim())).filter(value => !isNaN(value))
    if (values.length === 0) return

    const now = Date.now()
    const newItems = values.map((value, index) => ({ id: nextId + index, value }))
    setStack(prev => [...prev, ...newItems])
    setHistory(prev => [
      ...prev,
      ...values.map((value, index) => ({ id: now + index, type: 'push' as const, value, timestamp: now + index })),
    ])
    setThoughts(prev => [...prev, `Pushed ${values.join(', ')} onto the stack. New top: ${values[values.length - 1]}.`])
    setNextId(prev => prev + values.length)
    setInputValue('')
  }, [inputValue, nextId])

  const popOp = useCallback(() => {
    if (stack.length === 0) {
      setThoughts(prev => [...prev, "Cannot pop from an empty stack!"])
      return
    }

    const topItem = stack[stack.length - 1]
    setPoppingItem(topItem.id)
    setThoughts(prev => [...prev, `Popping ${topItem.value} from the top. LIFO principle applied.`])

    setTimeout(() => {
      setStack(prev => prev.slice(0, -1))
      setHistory(prev => [...prev, { id: Date.now(), type: 'pop', value: topItem.value, timestamp: Date.now() }])
      setPoppingItem(null)
    }, 500)
  }, [stack])

  const peekOp = useCallback(() => {
    if (stack.length === 0) {
      setThoughts(prev => [...prev, "Stack is empty, nothing to peek."])
      return
    }
    const topItem = stack[stack.length - 1]
    setHistory(prev => [...prev, { id: Date.now(), type: 'peek', value: topItem.value, timestamp: Date.now() }])
    setThoughts(prev => [...prev, `Peeking at the top element: ${topItem.value}.`])
  }, [stack])

  const reset = useCallback(() => {
    setStack([])
    setHistory([])
    setThoughts([])
    setInputValue('')
    setCode(getDefaultStackCode())
  }, [])

  const loadSampleStack = useCallback(() => {
    const values = [12, 24, 36, 48]
    setStack(values.map((value, index) => ({ id: index + 1, value })))
    setNextId(values.length + 1)
    setHistory(values.map((value, index) => ({
      id: Date.now() + index,
      type: 'push',
      value,
      timestamp: Date.now() + index,
    })))
    setThoughts(['Loaded a sample stack. The latest pushed value, 48, is now at the top.'])
    setCode(getStackCode(values.map(value => `s.push(${value})`).join('\n')))
  }, [])

  const fillPattern = useCallback((values: number[]) => {
    setInputValue(values.join(', '))
    setThoughts([`Loaded quick input: ${values.join(', ')}. Press Push to add them as batch operations.`])
  }, [])

  const runStackCode = useCallback(async () => {
    if (!pyodide || isRunning) return
    setIsThinking(true)
    const ops = history.map(h => {
      if (h.type === 'push') return `s.push(${h.value})`
      if (h.type === 'pop') return `s.pop()`
      return `s.peek()`
    }).join('\n')
    const codeToRun = getStackCode(ops || 's.push(10)')
    setCode(codeToRun)
    await runCode(codeToRun)
    setIsThinking(false)
  }, [pyodide, isRunning, history, runCode])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-10 pt-20 sm:px-6 sm:pb-12 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(212,165,116,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,165,116,0.5) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              maskImage: 'radial-gradient(ellipse 60% 60% at 40% 50%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 40% 50%, black 20%, transparent 70%)',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage: 'linear-gradient(rgba(212,165,116,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(212,165,116,0.8) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
              }}
            />
          </motion.div>

          {/* Orbs */}
          <motion.div
            animate={{ x: [0, -35, 25, 0], y: [0, 25, -30, 0], scale: [1, 1.12, 0.92, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-16 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'rgba(212,165,116,0.07)' }}
          />
        </div>

        <div className="relative mx-auto max-w-[1480px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.button
              onClick={() => setCurrentPage('home')}
              whileHover={{ x: -3 }}
              className="text-xs text-muted-foreground hover:text-slate-950 transition-colors mb-6"
            >
              ← Back to Home
            </motion.button>
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold"
              >
                <Layers className="w-5 h-5" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-2xl font-bold text-slate-950 sm:text-3xl md:text-4xl"
                >
                  Stack Data Structure
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-sm text-muted-foreground"
                >
                  Experiment 2 — LIFO visualization with real-time animations
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Usage Thoughts Panel */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px]">
          <UsageThoughts thoughts={thoughts} visible={thoughts.length > 0 || isThinking} isThinking={isThinking} />
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 grid max-w-[1480px] grid-cols-1 gap-3 md:grid-cols-4">
          {[
            ['1', 'Enter values', 'Single number or comma-separated batch.'],
            ['2', 'Push / Pop / Peek', 'Watch the top pointer move instantly.'],
            ['3', 'Inspect code', 'Python operations sync from your actions.'],
            ['4', 'Read theory', 'Connect the visual stack to LIFO behavior.'],
          ].map(([step, title, desc]) => (
            <div key={step} className="rounded-2xl glass p-4">
              <div className="w-7 h-7 rounded-full bg-gold/10 text-gold flex items-center justify-center text-xs font-bold mb-3">{step}</div>
              <p className="text-sm font-semibold text-slate-950">{title}</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Stack Visualization */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-4 glass sm:p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gold" />
                    Watch it Live
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">The stack pointer always targets the most recently pushed value.</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Stack Pointer</p>
                  <p className="text-sm font-mono font-bold text-gold">SP = 0x{Math.max(stack.length - 1, 0).toString(16).padStart(2, '0')}</p>
                </div>
              </div>

              {/* Stack Container */}
              <div className="relative mx-auto max-w-xs">
                {/* Top Pointer */}
                <AnimatePresence>
                  {stack.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 mb-3 pl-2"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gold/60">Top</span>
                      <ArrowDown className="w-3 h-3 text-gold/60" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Stack Items */}
                <div className="min-h-[260px] flex flex-col-reverse gap-2 rounded-xl border-0 bg-slate-50/85 p-3 sm:min-h-[300px] sm:border sm:border-slate-200 sm:p-4">
                  <AnimatePresence mode="popLayout">
                    {stack.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center h-[200px] text-xs text-muted-foreground/30 italic"
                      >
                        Stack is empty — Push an element
                      </motion.div>
                    )}
                    {stack.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -50, scale: 0.8 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: { type: 'spring', stiffness: 300, damping: 25 },
                        }}
                        exit={{
                          opacity: 0,
                          y: -80,
                          scale: 0.5,
                          transition: { duration: 0.4, ease: 'easeIn' },
                        }}
                        className={`relative flex items-center justify-center py-3 rounded-lg border transition-all duration-300 ${
                          index === stack.length - 1
                            ? poppingItem === item.id
                              ? 'bg-red-500/10 border-red-500/30 glow-red'
                              : 'bg-gold/10 border-gold/30 glow-gold'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="absolute left-2 text-[9px] font-mono text-muted-foreground">
                          0x{index.toString(16).padStart(2, '0')}
                        </span>
                        <span className="text-lg font-bold text-slate-950">{item.value}</span>
                        {index === stack.length - 1 && (
                          <span className="absolute right-2 flex items-center gap-1 text-[9px] text-gold">
                            <ArrowDown className="w-3 h-3" /> SP
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Base */}
                <div className="h-1 bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 rounded-full mt-2" />
              </div>

              {/* Size indicator */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground sm:gap-4">
                <span>Size: <span className="text-slate-950 font-semibold">{stack.length}</span></span>
                <span>•</span>
                <span>Visual capacity: <span className="text-slate-950 font-semibold">{stack.length}/{maxVisualCapacity}</span></span>
                <span>•</span>
                <span>Complexity: <span className="text-gold font-semibold">O(1)</span></span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  animate={{ width: `${Math.min((stack.length / maxVisualCapacity) * 100, 100)}%` }}
                  className="h-full bg-gradient-to-r from-gold to-gold-muted"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  ['Base', '0x00'],
                  ['SP', stack.length ? `0x${(stack.length - 1).toString(16).padStart(2, '0')}` : 'empty'],
                  ['Capacity', `${stack.length}/${maxVisualCapacity}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                    <p className="text-[9px] text-muted-foreground">{label}</p>
                    <p className="text-xs font-mono font-semibold text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl glass p-5"
            >
              <h3 className="text-sm font-semibold text-slate-950 mb-1">Interact with the Stack</h3>
              <p className="text-xs text-muted-foreground mb-4">Enter a value, or several values separated by commas, and push them onto the stack.</p>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && pushOp()}
                  placeholder="Value or batch: 10, 20, 30"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 transition-colors focus:border-gold/30 focus:outline-none"
                />
                <motion.button
                  onClick={pushOp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Push
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  ['Random', [17, 42, 8]],
                  ['Fibonacci', [1, 1, 2, 3, 5]],
                  ['Powers', [2, 4, 8, 16]],
                ].map(([label, values]) => (
                  <button
                    key={label as string}
                    type="button"
                    onClick={() => fillPattern(values as number[])}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-muted-foreground hover:text-slate-950"
                  >
                    {label as string}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <motion.button
                  onClick={popOp}
                  disabled={stack.length === 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-30 sm:flex-1"
                >
                  <Minus className="w-3.5 h-3.5" /> Pop
                </motion.button>
                <motion.button
                  onClick={peekOp}
                  disabled={stack.length === 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-lavender/10 px-4 py-2 text-sm font-medium text-lavender transition-colors hover:bg-lavender/20 disabled:cursor-not-allowed disabled:opacity-30 sm:flex-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Peek
                </motion.button>
                <motion.button
                  onClick={reset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors glass hover:text-slate-950 sm:col-span-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </motion.button>
              </div>
              <button
                type="button"
                onClick={loadSampleStack}
                className="mt-3 w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-muted-foreground text-xs hover:text-slate-950 transition-colors"
              >
                Load Sample Stack
              </button>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Python Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl glass p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Python Code
                </h3>
                <motion.button
                  onClick={runStackCode}
                  disabled={!pyodide || isRunning || pyodideLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isRunning
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gradient-to-r from-gold to-gold-muted text-white glow-gold'
                  }`}
                >
                  {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {pyodideLoading ? 'Loading...' : isRunning ? 'Running...' : 'Run Code'}
                </motion.button>
              </div>
              <div className="overflow-hidden rounded-lg border-0 bg-white/60 sm:border sm:border-slate-200">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-56 w-full bg-white px-3 py-3 text-xs font-mono text-slate-800 resize-none focus:outline-none sm:h-64 sm:p-4"
                  spellCheck={false}
                />
              </div>
              {output && (
                <div className="mt-3 max-h-32 overflow-y-auto rounded-lg border-0 bg-slate-50/85 p-3 text-xs font-mono text-slate-600 sm:border sm:border-slate-200">
                  {output}
                </div>
              )}
            </motion.div>

            {/* Operation History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl glass p-5"
            >
              <h3 className="text-sm font-semibold text-slate-950 mb-4">Operation History</h3>
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ['Push', operationStats.pushes, 'text-gold'],
                  ['Pop', operationStats.pops, 'text-red-400'],
                  ['Peek', operationStats.peeks, 'text-lavender'],
                  ['Total', operationStats.total, 'text-slate-950'],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
                    <p className={`text-sm font-bold ${color}`}>{value}</p>
                    <p className="text-[9px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Operation Timeline</p>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {history.length === 0 ? (
                    <div className="h-8 flex-1 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-[10px] text-muted-foreground flex items-center justify-center">
                      Push, pop, or peek to build the timeline
                    </div>
                  ) : history.map((op, index) => (
                    <div
                      key={`${op.id}-${index}`}
                      title={`${op.type.toUpperCase()} ${op.value ?? ''}`}
                      className={`h-8 min-w-10 rounded-lg flex items-center justify-center text-[9px] font-bold ${
                        op.type === 'push' ? 'bg-gold/15 text-gold' :
                        op.type === 'pop' ? 'bg-red-500/10 text-red-400' :
                        'bg-lavender/10 text-lavender'
                      }`}
                    >
                      {op.type[0].toUpperCase()}{op.value}
                    </div>
                  ))}
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                <AnimatePresence>
                  {history.length === 0 && (
                    <p className="text-xs text-muted-foreground/30 italic">No operations yet...</p>
                  )}
                  {history.map((op) => (
                    <motion.div
                      key={op.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                        op.type === 'push' ? 'bg-gold/5 text-gold' :
                        op.type === 'pop' ? 'bg-red-500/5 text-red-400' :
                        'bg-lavender/5 text-lavender'
                      }`}
                    >
                      {op.type === 'push' ? <ArrowDown className="w-3 h-3" /> :
                       op.type === 'pop' ? <ArrowUp className="w-3 h-3" /> :
                       <Eye className="w-3 h-3" />}
                      <span className="font-mono">
                        {op.type.toUpperCase()}({op.value})
                        {op.type === 'pop' && <span className="text-muted-foreground ml-1">→ {op.value} removed</span>}
                        {op.type === 'peek' && <span className="text-muted-foreground ml-1">→ {op.value}</span>}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl glass p-5"
          >
            <h3 className="text-sm font-semibold text-slate-950 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold" />
              Class Anatomy
            </h3>
            <div className="rounded-lg bg-slate-950 text-slate-100 p-4 font-mono text-[11px] space-y-1">
              <p className="text-gold">class Stack:</p>
              <p className="pl-4 text-slate-300">- items: list</p>
              <p className="pl-4 text-slate-300">+ push(item)</p>
              <p className="pl-4 text-slate-300">+ pop()</p>
              <p className="pl-4 text-slate-300">+ peek()</p>
              <p className="pl-4 text-slate-300">+ is_empty()</p>
            </div>
            <div className="mt-4 space-y-2">
              {[
                ['Encapsulation', 'The list is owned by the Stack object.'],
                ['State', 'Each operation changes or reads items.'],
                ['LIFO Rule', 'Only the top element is removed first.'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-gold mt-0.5" />
                  <p className="text-[11px] text-muted-foreground"><span className="font-semibold text-slate-950">{title}:</span> {desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl glass p-5"
          >
            <h3 className="text-sm font-semibold text-slate-950 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold" />
              Operation Complexity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { op: 'Push', complexity: 'O(1)', desc: 'Append to the top' },
                { op: 'Pop', complexity: 'O(1)', desc: 'Remove from the top' },
                { op: 'Peek', complexity: 'O(1)', desc: 'Read the top element' },
                { op: 'isEmpty', complexity: 'O(1)', desc: 'Check stack length' },
              ].map((item) => (
                <div key={item.op} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{item.op}</span>
                    <span className="text-xs font-mono font-bold text-gold">{item.complexity}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl glass p-5"
          >
            <h3 className="text-sm font-semibold text-slate-950 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-lavender" />
              Why Stacks Matter
            </h3>
            <div className="space-y-3">
              {[
                {
                  title: 'Undo Operations',
                  desc: 'Editors push every action onto a stack. Undo pops the most recent action first.',
                },
                {
                  title: 'Browser History',
                  desc: 'Back navigation follows the latest page first, matching the LIFO pattern.',
                },
                {
                  title: 'Function Calls',
                  desc: 'The call stack tracks active functions and pops each one when it returns.',
                },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-950 mb-1">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
