'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/app-store'
import { usePyodide } from '@/hooks/use-pyodide'
import { Layers, Play, Plus, Minus, Eye, RotateCcw, Loader2, ArrowDown, ArrowUp, Zap, CheckCircle } from 'lucide-react'

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

  const pushOp = useCallback(() => {
    const val = parseInt(inputValue)
    if (isNaN(val)) return

    const id = nextId
    setStack(prev => [...prev, { id, value: val }])
    setHistory(prev => [...prev, { id: Date.now(), type: 'push', value: val, timestamp: Date.now() }])
    setThoughts(prev => [...prev, `Pushing ${val} onto the stack. New top: ${val}.`])
    setNextId(prev => prev + 1)
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
      <section className="relative px-6 pt-16 pb-12 overflow-hidden">
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

        <div className="relative max-w-6xl mx-auto">
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
                  className="text-3xl md:text-4xl font-bold text-slate-950"
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
      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <UsageThoughts thoughts={thoughts} visible={thoughts.length > 0 || isThinking} isThinking={isThinking} />
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Stack Visualization */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl glass p-6"
            >
              <h3 className="text-sm font-semibold text-slate-950 mb-6 flex items-center gap-2">
                <Layers className="w-4 h-4 text-gold" />
                Stack Visualization
              </h3>

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
                <div className="min-h-[300px] flex flex-col-reverse gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
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
                        <span className="text-lg font-bold text-slate-950">{item.value}</span>
                        {index === stack.length - 1 && (
                          <span className="absolute right-2 text-[9px] text-gold/40">TOP</span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Base */}
                <div className="h-1 bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 rounded-full mt-2" />
              </div>

              {/* Size indicator */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>Size: <span className="text-slate-950 font-semibold">{stack.length}</span></span>
                <span>•</span>
                <span>Complexity: <span className="text-gold font-semibold">O(1)</span></span>
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl glass p-5"
            >
              <h3 className="text-sm font-semibold text-slate-950 mb-4">Operations</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && pushOp()}
                  placeholder="Value..."
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-950 text-sm focus:outline-none focus:border-gold/30 transition-colors"
                />
                <motion.button
                  onClick={pushOp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Push
                </motion.button>
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={popOp}
                  disabled={stack.length === 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" /> Pop
                </motion.button>
                <motion.button
                  onClick={peekOp}
                  disabled={stack.length === 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 rounded-lg bg-lavender/10 text-lavender text-sm font-medium hover:bg-lavender/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Eye className="w-3.5 h-3.5" /> Peek
                </motion.button>
                <motion.button
                  onClick={reset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg glass text-muted-foreground text-sm hover:text-slate-950 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </motion.button>
              </div>
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
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-64 p-4 bg-white text-slate-800 text-xs font-mono resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
              {output && (
                <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 max-h-32 overflow-y-auto">
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

      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
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
