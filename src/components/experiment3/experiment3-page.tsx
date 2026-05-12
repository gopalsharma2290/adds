'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/app-store'
import { usePyodide } from '@/hooks/use-pyodide'
import { ArrowUpDown, Play, Pause, RotateCcw, SkipForward, Loader2, Zap, GitCompare, ArrowLeftRight, Trophy } from 'lucide-react'

interface SortBar {
  id: number
  value: number
  state: 'default' | 'comparing' | 'swapping' | 'sorted'
}

type SpeedMode = 'slow' | 'medium' | 'fast'

const speedMap: Record<SpeedMode, number> = {
  slow: 800,
  medium: 400,
  fast: 100,
}

const defaultArray = [64, 34, 25, 12, 22, 11, 90, 45, 78, 33]

const bubbleSortCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            # Compare adjacent elements
            if arr[j] > arr[j + 1]:
                # Swap if needed
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        # If no swaps, array is sorted
        if not swapped:
            break
    return arr

# Test
arr = [64, 34, 25, 12, 22, 11, 90, 45, 78, 33]
print(f"Original: {arr}")
sorted_arr = bubble_sort(arr.copy())
print(f"Sorted:   {sorted_arr}")
print(f"\\nTime Complexity:")
print(f"  Worst Case:  O(n²)")
print(f"  Best Case:   O(n) — already sorted")
print(f"  Average:     O(n²)")
print(f"\\nSpace Complexity: O(1) — in-place sorting")
print(f"\\nNote: Python's built-in sort() uses Timsort (O(n log n))")
`

import { UsageThoughts } from '@/components/ui/usage-thoughts'

export function Experiment3Page() {
  const { setCurrentPage } = useAppStore()
  const { pyodide, loading: pyodideLoading, runCode, output, isRunning: pyodideRunning } = usePyodide()
  const [array, setArray] = useState<SortBar[]>(defaultArray.map((v, i) => ({ id: i, value: v, state: 'default' })))
  const [inputText, setInputText] = useState(defaultArray.join(', '))
  const [sorting, setSorting] = useState(false)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState<SpeedMode>('medium')
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [passes, setPasses] = useState(0)
  const [thoughts, setThoughts] = useState<string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [sorted, setSorted] = useState(false)
  const [code, setCode] = useState(bubbleSortCode)
  const abortRef = useRef(false)
  const pausedRef = useRef(false)

  // Keep pausedRef in sync
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  const reset = useCallback(() => {
    abortRef.current = true
    setSorting(false)
    setPaused(false)
    setComparisons(0)
    setSwaps(0)
    setPasses(0)
    setThoughts([])
    setSorted(false)
    const nums = inputText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    if (nums.length > 0) {
      setArray(nums.map((v, i) => ({ id: i, value: v, state: 'default' })))
    }
  }, [inputText])

  const wait = useCallback((ms: number) => new Promise<void>(resolve => {
    const check = () => {
      if (abortRef.current) { resolve(); return }
      if (pausedRef.current) { setTimeout(check, 100); return }
      setTimeout(resolve, ms)
    }
    check()
  }), [])

  const startSort = useCallback(async () => {
    abortRef.current = false
    setSorting(true)
    setSorted(false)
    setComparisons(0)
    setSwaps(0)
    setPasses(0)
    setThoughts(["Initializing Bubble Sort algorithm.", "Target: Bubble the largest elements to the end."])

    const currentArray = [...array]
    const n = currentArray.length

    for (let i = 0; i < n - 1; i++) {
      if (abortRef.current) break
      let swapped = false
      setPasses(p => p + 1)
      setThoughts(prev => [...prev.slice(-4), `Pass ${i + 1}: Starting scan of unsorted portion.`])

      for (let j = 0; j < n - i - 1; j++) {
        if (abortRef.current) break

        // Highlight comparing pair
        setArray(prev => prev.map((bar, idx) => ({
          ...bar,
          state: idx === j || idx === j + 1 ? 'comparing' : bar.state === 'sorted' ? 'sorted' : 'default'
        })))
        setComparisons(c => c + 1)
        
        if (currentArray[j].value > currentArray[j + 1].value) {
          setThoughts(prev => [...prev.slice(-4), `Found ${currentArray[j].value} > ${currentArray[j + 1].value}. Swapping positions.`])
          // Swap
          setArray(prev => prev.map((bar, idx) => ({
            ...bar,
            state: idx === j || idx === j + 1 ? 'swapping' : bar.state === 'sorted' ? 'sorted' : 'default'
          })))
          await wait(speedMap[speed] / 2)

          // Perform swap
          const temp = currentArray[j]
          currentArray[j] = currentArray[j + 1]
          currentArray[j + 1] = temp
          swapped = true
          setSwaps(s => s + 1)

          setArray(prev => {
            const newArr = [...prev]
            const tempBar = newArr[j]
            newArr[j] = { ...newArr[j + 1], state: 'swapping' }
            newArr[j + 1] = { ...tempBar, state: 'swapping' }
            return newArr
          })
          await wait(speedMap[speed] / 2)
        } else {
          await wait(speedMap[speed])
        }

        if (abortRef.current) break

        // Reset states
        setArray(prev => prev.map((bar, idx) => ({
          ...bar,
          state: bar.state === 'sorted' ? 'sorted' : 'default'
        })))
      }

      // Mark last element as sorted
      setArray(prev => prev.map((bar, idx) => {
        if (idx === n - i - 1) return { ...bar, state: 'sorted' }
        return bar
      }))

      // Early termination
      if (!swapped) {
        setThoughts(prev => [...prev, "No swaps in this pass. Array is now fully sorted!"])
        break
      }
    }

    // Mark all as sorted
    setArray(prev => prev.map(bar => ({ ...bar, state: 'sorted' })))
    setSorted(true)
    setSorting(false)
    setThoughts(prev => [...prev, "Execution complete. Array sorted successfully."])
  }, [array, speed, wait])

  const runPythonCode = useCallback(async () => {
    if (!pyodide || pyodideRunning) return
    setIsThinking(true)
    await runCode(code)
    setIsThinking(false)
  }, [pyodide, pyodideRunning, code, runCode])

  const getBarColor = (state: SortBar['state']) => {
    switch (state) {
      case 'comparing': return 'bg-yellow-400 glow-yellow'
      case 'swapping': return 'bg-red-400 glow-red'
      case 'sorted': return 'bg-emerald-400 glow-green'
      default: return 'bg-lavender/60'
    }
  }

  const maxVal = Math.max(...array.map(b => b.value), 1)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(52,211,153,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.5) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              maskImage: 'radial-gradient(ellipse 60% 60% at 55% 45%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 55% 45%, black 20%, transparent 70%)',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(rgba(52,211,153,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.8) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
              }}
            />
          </motion.div>

          {/* Orbs */}
          <motion.div
            animate={{ x: [0, 30, -25, 0], y: [0, -25, 30, 0], scale: [1, 1.12, 0.9, 1] }}
            transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 right-1/3 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'rgba(52,211,153,0.07)' }}
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
              className="text-xs text-muted-foreground hover:text-cream transition-colors mb-6"
            >
              ← Back to Home
            </motion.button>
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"
              >
                <ArrowUpDown className="w-5 h-5" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-3xl md:text-4xl font-bold text-cream"
                >
                  Bubble Sort Visualization
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-sm text-muted-foreground"
                >
                  Experiment 3 — Watch the algorithm think step-by-step
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

      {/* Controls */}
      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl glass p-5"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sorting}
                placeholder="e.g. 5, 3, 8, 1, 9"
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-[#0a0d20] border border-white/[0.06] text-cream text-sm focus:outline-none focus:border-emerald-500/30 transition-colors disabled:opacity-50"
              />
              <div className="flex gap-2">
                {!sorting ? (
                  <motion.button
                    onClick={startSort}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-navy text-sm font-semibold glow-green hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> Sort
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => setPaused(!paused)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-semibold flex items-center gap-1.5"
                  >
                    {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    {paused ? 'Resume' : 'Pause'}
                  </motion.button>
                )}
                <motion.button
                  onClick={reset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg glass text-muted-foreground text-sm hover:text-cream transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </motion.button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Speed:</span>
              {(['slow', 'medium', 'fast'] as SpeedMode[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  disabled={sorting}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    speed === s ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-cream'
                  } disabled:opacity-50`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visualization Area */}
      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bars Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 rounded-2xl glass p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-cream">Sorting Visualization</h3>
            </div>

            <div className="flex items-end justify-center gap-2 h-64 px-4">
              <AnimatePresence>
                {array.map((bar, index) => (
                  <motion.div
                    key={bar.id}
                    layout
                    initial={false}
                    animate={{
                      height: `${(bar.value / maxVal) * 100}%`,
                      transition: { type: 'spring', stiffness: 300, damping: 30 },
                    }}
                    className={`relative flex-1 max-w-[60px] rounded-t-lg transition-colors duration-200 ${getBarColor(bar.state)}`}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-cream/60 font-mono">
                      {bar.value}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-lavender/60" />
                <span>Unsorted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-yellow-400" />
                <span>Comparing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                <span>Swapping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                <span>Sorted</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="rounded-2xl glass p-5">
              <h3 className="text-sm font-semibold text-cream mb-4">Live Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03] text-center">
                  <GitCompare className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-cream">{comparisons}</p>
                  <p className="text-[10px] text-muted-foreground">Comparisons</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03] text-center">
                  <ArrowLeftRight className="w-4 h-4 text-red-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-cream">{swaps}</p>
                  <p className="text-[10px] text-muted-foreground">Swaps</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03] text-center">
                  <SkipForward className="w-4 h-4 text-lavender mx-auto mb-1" />
                  <p className="text-lg font-bold text-cream">{passes}</p>
                  <p className="text-[10px] text-muted-foreground">Passes</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03] text-center">
                  <Trophy className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-cream">{sorted ? '✓' : '...'}</p>
                  <p className="text-[10px] text-muted-foreground">Status</p>
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className="rounded-2xl glass p-5">
              <h3 className="text-sm font-semibold text-cream mb-3">Complexity Analysis</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-muted-foreground">Worst Case</span>
                  <span className="text-red-400 font-mono font-semibold">O(n²)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-muted-foreground">Best Case</span>
                  <span className="text-emerald-400 font-mono font-semibold">O(n)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-muted-foreground">Average</span>
                  <span className="text-yellow-400 font-mono font-semibold">O(n²)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-muted-foreground">Space</span>
                  <span className="text-lavender font-mono font-semibold">O(1)</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Python Code & Explanation */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl glass p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-cream flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Python Implementation
              </h3>
              <motion.button
                onClick={runPythonCode}
                disabled={!pyodide || pyodideRunning || pyodideLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-navy"
              >
                {pyodideRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {pyodideLoading ? 'Loading...' : 'Run'}
              </motion.button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 rounded-lg bg-[#0d1130] border border-white/[0.04] text-cream/90 text-xs font-mono resize-none focus:outline-none"
              spellCheck={false}
            />
            {output && (
              <div className="mt-3 p-3 rounded-lg bg-[#0a0d20] border border-white/[0.04] text-xs font-mono text-cream/70 max-h-32 overflow-y-auto">
                {output}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl glass p-5"
          >
            <h3 className="text-sm font-semibold text-cream mb-4">How Bubble Sort Works</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                <p className="text-xs font-semibold text-yellow-400 mb-1 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Step 1: Compare
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Starting from the first element, compare each pair of adjacent elements. If the left element is greater than the right, they need to be swapped.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                <p className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3 h-3" /> Step 2: Swap
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  When a larger element is found before a smaller one, swap their positions. This &quot;bubbles&quot; the larger element toward the end of the array.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                <p className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <SkipForward className="w-3 h-3" /> Step 3: Repeat
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  After each complete pass, the largest unsorted element settles at its correct position. Repeat passes until no more swaps are needed.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
