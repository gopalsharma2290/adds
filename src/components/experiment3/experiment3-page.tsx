'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/app-store'
import { usePyodide } from '@/hooks/use-pyodide'
import { ArrowUpDown, Play, Pause, RotateCcw, SkipForward, Loader2, Zap, GitCompare, ArrowLeftRight, Trophy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface SortBar {
  id: number
  value: number
  state: 'default' | 'comparing' | 'swapping' | 'sorted'
}

type SpeedMode = 'slow' | 'medium' | 'fast'
type RaceMetric = {
  name: string
  best: string
  average: string
  worst: string
  space: string
  comparisons: number
  swaps: number
  timeMs: number
}
type RaceAlgorithm = 'Bubble Sort' | 'Selection Sort' | 'Insertion Sort' | 'Merge Sort'
type RaceVisualizer = RaceMetric & {
  values: number[]
  active: number[]
  sorted: boolean
  status: string
}

const speedMap: Record<SpeedMode, number> = {
  slow: 800,
  medium: 400,
  fast: 100,
}

const defaultArray = [64, 34, 25, 12, 22, 11, 90, 45, 78, 33]
const presets = {
  random: [64, 34, 25, 12, 22, 11, 90, 45, 78, 33],
  sorted: [5, 11, 12, 22, 25, 34, 45, 64, 78, 90],
  reversed: [90, 78, 64, 45, 34, 33, 25, 22, 12, 11],
  nearly: [5, 11, 12, 25, 22, 34, 45, 64, 90, 78],
}

const raceComplexities: Record<RaceAlgorithm, Pick<RaceMetric, 'best' | 'average' | 'worst' | 'space'>> = {
  'Bubble Sort': { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  'Selection Sort': { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  'Insertion Sort': { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  'Merge Sort': { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
}

const createRaceVisualizers = (values: number[]): RaceVisualizer[] => (
  (Object.keys(raceComplexities) as RaceAlgorithm[]).map(name => ({
    name,
    ...raceComplexities[name],
    values: [...values],
    active: [],
    sorted: false,
    status: 'Ready',
    comparisons: 0,
    swaps: 0,
    timeMs: 0,
  }))
)

const bubbleSortCode = `def bubble_sort(arr):
    """Bubble Sort with step tracking"""
    n = len(arr)
    comparisons = 0
    swaps = 0

    print(f"Original array: {arr}")

    for i in range(n):
        swapped = False
        print(f"\\nPass {i + 1}:")

        for j in range(0, n - i - 1):
            comparisons += 1
            print(f"  Compare: {arr[j]} vs {arr[j + 1]}", end="")

            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swaps += 1
                swapped = True
                print(f" -> Swap! Now: {arr}")
            else:
                print(" -> No swap")

        if not swapped:
            print("  No swaps in this pass. Array is sorted!")
            break

    print("\\n=== Results ===")
    print(f"Sorted array: {arr}")
    print(f"Total comparisons: {comparisons}")
    print(f"Total swaps: {swaps}")
    return arr

# Test
arr = [64, 34, 25, 12, 22, 11, 90, 45, 78, 33]
sorted_arr = bubble_sort(arr.copy())

print(f"\\nPython sorted(): {sorted(arr)}")
print("Timsort uses O(n log n) time, which is much faster than Bubble Sort's O(n²) on large lists.")
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
  const [currentExplanation, setCurrentExplanation] = useState('Click Sort to begin visualization.')
  const [inputDirty, setInputDirty] = useState(false)
  const [raceResults, setRaceResults] = useState<RaceMetric[]>([])
  const [raceVisualizers, setRaceVisualizers] = useState<RaceVisualizer[]>(() => createRaceVisualizers(defaultArray))
  const [raceRunning, setRaceRunning] = useState(false)
  const abortRef = useRef(false)
  const pausedRef = useRef(false)

  const algorithmComparison = useMemo(() => {
    const n = array.length
    const bubbleWorst = Math.max(0, (n * (n - 1)) / 2)
    const bubbleBest = Math.max(0, n - 1)
    const nLogN = n > 1 ? Math.ceil(n * Math.log2(n)) : 0
    const speedup = nLogN > 0 ? Math.max(1, Math.round(bubbleWorst / nLogN)) : 1
    return { n, bubbleWorst, bubbleBest, nLogN, speedup }
  }, [array])

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
    setCurrentExplanation('Click Sort to begin visualization.')
    const nums = inputText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    if (nums.length > 0) {
      setArray(nums.map((v, i) => ({ id: i, value: v, state: 'default' })))
    }
  }, [inputText])

  const applyInput = useCallback((nextText = inputText) => {
    const nums = nextText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    if (nums.length === 0 || sorting) return
    abortRef.current = true
    setArray(nums.map((v, i) => ({ id: i, value: v, state: 'default' })))
    setComparisons(0)
    setSwaps(0)
    setPasses(0)
    setSorted(false)
    setRaceResults([])
    setRaceVisualizers(createRaceVisualizers(nums))
    setInputDirty(false)
    setCurrentExplanation(`Applied ${nums.length} values. The chart is ready before sorting starts.`)
  }, [inputText, sorting])

  const handleInputChange = useCallback((nextText: string) => {
    setInputText(nextText)
    setInputDirty(true)
    if (!sorting) applyInput(nextText)
  }, [applyInput, sorting])

  const applyPreset = useCallback((values: number[]) => {
    abortRef.current = true
    setSorting(false)
    setPaused(false)
    setComparisons(0)
    setSwaps(0)
    setPasses(0)
    setSorted(false)
    setInputText(values.join(', '))
    setArray(values.map((value, index) => ({ id: index, value, state: 'default' })))
    setRaceResults([])
    setRaceVisualizers(createRaceVisualizers(values))
    setInputDirty(false)
    setCurrentExplanation('Preset loaded. Click Sort to compare the scenario.')
    setThoughts([`Loaded ${values.length} values. Bubble Sort behavior changes dramatically with input order.`])
  }, [])

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
    setCurrentExplanation('Starting Bubble Sort. Each pass pushes the largest remaining value to the right.')

    const currentArray = [...array]
    const n = currentArray.length

    for (let i = 0; i < n - 1; i++) {
      if (abortRef.current) break
      let swapped = false
      setPasses(p => p + 1)
      setThoughts(prev => [...prev.slice(-4), `Pass ${i + 1}: Starting scan of unsorted portion.`])
      setCurrentExplanation(`Pass ${i + 1}: scanning positions 0 through ${n - i - 1}.`)

      for (let j = 0; j < n - i - 1; j++) {
        if (abortRef.current) break

        setCurrentExplanation(`Comparing ${currentArray[j].value} and ${currentArray[j + 1].value}.`)
        // Highlight comparing pair
        setArray(prev => prev.map((bar, idx) => ({
          ...bar,
          state: idx === j || idx === j + 1 ? 'comparing' : bar.state === 'sorted' ? 'sorted' : 'default'
        })))
        setComparisons(c => c + 1)
        
        if (currentArray[j].value > currentArray[j + 1].value) {
          setThoughts(prev => [...prev.slice(-4), `Found ${currentArray[j].value} > ${currentArray[j + 1].value}. Swapping positions.`])
          setCurrentExplanation(`${currentArray[j].value} is greater than ${currentArray[j + 1].value}, so they swap.`)
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
          setCurrentExplanation(`${currentArray[j].value} is already <= ${currentArray[j + 1].value}. No swap needed.`)
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
        setCurrentExplanation('No swaps happened in this pass, so the array is fully sorted.')
        break
      }
    }

    // Mark all as sorted
    setArray(prev => prev.map(bar => ({ ...bar, state: 'sorted' })))
    setSorted(true)
    setSorting(false)
    setCurrentExplanation('Sorting complete. Every bar is in nondecreasing order.')
    setThoughts(prev => [...prev, "Execution complete. Array sorted successfully."])
  }, [array, speed, wait])

  const runPythonCode = useCallback(async () => {
    if (!pyodide || pyodideRunning) return
    setIsThinking(true)
    await runCode(code)
    setIsThinking(false)
  }, [pyodide, pyodideRunning, code, runCode])

  const updateRaceVisualizer = useCallback((name: RaceAlgorithm, updater: (current: RaceVisualizer) => RaceVisualizer) => {
    setRaceVisualizers(prev => prev.map(item => item.name === name ? updater(item) : item))
  }, [])

  const animateRaceAlgorithm = useCallback(async (name: RaceAlgorithm, sourceValues: number[]): Promise<RaceMetric> => {
    const values = [...sourceValues]
    let comparisons = 0
    let swaps = 0
    const started = performance.now()
    const frameDelay = Math.max(45, speedMap[speed] / 5)
    const publish = async (active: number[], status: string) => {
      updateRaceVisualizer(name, current => ({
        ...current,
        values: [...values],
        active,
        status,
        comparisons,
        swaps,
      }))
      await wait(frameDelay)
    }

    if (name === 'Bubble Sort') {
      for (let i = 0; i < values.length - 1; i++) {
        for (let j = 0; j < values.length - i - 1; j++) {
          comparisons += 1
          await publish([j, j + 1], `Compare ${values[j]} and ${values[j + 1]}`)
          if (values[j] > values[j + 1]) {
            ;[values[j], values[j + 1]] = [values[j + 1], values[j]]
            swaps += 1
            await publish([j, j + 1], 'Swap adjacent values')
          }
        }
      }
    }

    if (name === 'Selection Sort') {
      for (let i = 0; i < values.length - 1; i++) {
        let minIndex = i
        for (let j = i + 1; j < values.length; j++) {
          comparisons += 1
          await publish([minIndex, j], `Find minimum for slot ${i + 1}`)
          if (values[j] < values[minIndex]) minIndex = j
        }
        if (minIndex !== i) {
          ;[values[i], values[minIndex]] = [values[minIndex], values[i]]
          swaps += 1
          await publish([i, minIndex], 'Move minimum into place')
        }
      }
    }

    if (name === 'Insertion Sort') {
      for (let i = 1; i < values.length; i++) {
        const key = values[i]
        let j = i - 1
        await publish([i], `Insert ${key}`)
        while (j >= 0) {
          comparisons += 1
          await publish([j, j + 1], `Compare ${values[j]} with ${key}`)
          if (values[j] <= key) break
          values[j + 1] = values[j]
          swaps += 1
          await publish([j, j + 1], 'Shift value right')
          j -= 1
        }
        values[j + 1] = key
        await publish([j + 1], 'Place key')
      }
    }

    if (name === 'Merge Sort') {
      const mergeSort = async (left: number, right: number): Promise<void> => {
        if (right - left <= 1) return
        const mid = Math.floor((left + right) / 2)
        await mergeSort(left, mid)
        await mergeSort(mid, right)
        const merged: number[] = []
        let i = left
        let j = mid
        while (i < mid && j < right) {
          comparisons += 1
          await publish([i, j], `Merge ranges ${left + 1}-${right}`)
          if (values[i] <= values[j]) merged.push(values[i++])
          else {
            merged.push(values[j++])
            swaps += 1
          }
        }
        while (i < mid) merged.push(values[i++])
        while (j < right) merged.push(values[j++])
        merged.forEach((value, index) => {
          values[left + index] = value
        })
        await publish(Array.from({ length: right - left }, (_, index) => left + index), 'Write merged range')
      }
      await mergeSort(0, values.length)
    }

    updateRaceVisualizer(name, current => ({
      ...current,
      values: [...values],
      active: [],
      sorted: true,
      status: 'Sorted',
      comparisons,
      swaps,
      timeMs: Math.max(0.01, performance.now() - started),
    }))
    return {
      name,
      ...raceComplexities[name],
      comparisons,
      swaps,
      timeMs: Math.max(0.01, performance.now() - started),
    }
  }, [speed, updateRaceVisualizer, wait])

  const runVisualAlgorithmRace = useCallback(async () => {
    if (raceRunning || sorting) return
    const values = array.map(item => item.value)
    setRaceRunning(true)
    setRaceResults([])
    setRaceVisualizers(createRaceVisualizers(values))
    setThoughts(prev => [...prev.slice(-3), 'Starting live race: four algorithms sorting the same values.'])
    const results = await Promise.all((Object.keys(raceComplexities) as RaceAlgorithm[]).map(name => animateRaceAlgorithm(name, values)))
    setRaceRunning(false)
    setRaceResults(results)
    setThoughts(prev => [...prev.slice(-3), 'Live algorithm race complete. Each panel used the same input array.'])
  }, [animateRaceAlgorithm, array, raceRunning, sorting])

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
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-10 pt-20 sm:px-6 sm:pb-12 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'radial-gradient(rgba(6,44,38,0.22) 0.8px, transparent 0.8px)',
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
                className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"
              >
                <ArrowUpDown className="w-5 h-5" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-2xl font-bold text-slate-950 sm:text-3xl md:text-4xl"
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
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px]">
          <UsageThoughts thoughts={thoughts} visible={thoughts.length > 0 || isThinking} isThinking={isThinking} />
        </div>
      </section>

      {/* Controls */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl glass p-5"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyInput()}
                disabled={sorting}
                placeholder="e.g. 5, 3, 8, 1, 9"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 transition-colors focus:border-emerald-500/30 focus:outline-none disabled:opacity-50"
              />
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <motion.button
                  onClick={() => applyInput()}
                  disabled={sorting}
                  animate={inputDirty ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                  transition={{ duration: 0.8, repeat: inputDirty ? Infinity : 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-emerald-600 disabled:opacity-50"
                >
                  Apply
                </motion.button>
                {!sorting ? (
                  <motion.button
                    onClick={startSort}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white glow-green hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]"
                  >
                    <Play className="w-3.5 h-3.5" /> Sort
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => setPaused(!paused)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-yellow-500/20 px-5 py-2 text-sm font-semibold text-yellow-400"
                  >
                    {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    {paused ? 'Resume' : 'Pause'}
                  </motion.button>
                )}
                <motion.button
                  onClick={reset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors glass hover:text-slate-950 sm:col-span-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </motion.button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-xs text-muted-foreground">Speed:</span>
              {(['slow', 'medium', 'fast'] as SpeedMode[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  disabled={sorting}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    speed === s ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted-foreground hover:text-slate-950'
                  } disabled:opacity-50`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Presets:</span>
              {([
                ['random', 'Random'],
                ['sorted', 'Sorted'],
                ['reversed', 'Reversed'],
                ['nearly', 'Nearly Sorted'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(presets[key])}
                  disabled={sorting}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-muted-foreground hover:text-slate-950 disabled:opacity-50 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visualization Area */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Bars Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-4 glass sm:p-6 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-950">Sorting Visualization</h3>
            </div>

            <div className="mx-[-4px] flex h-[30rem] items-end justify-center gap-1 overflow-x-auto rounded-xl border-0 bg-slate-50/65 px-2 py-8 sm:mx-0 sm:h-[34rem] sm:gap-2 sm:border sm:border-slate-200 sm:bg-transparent sm:px-4 sm:py-8">
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
                    className={`relative min-w-7 flex-1 max-w-[60px] rounded-t-lg transition-colors duration-200 ${getBarColor(bar.state)}`}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-mono">
                      {bar.value}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground sm:gap-6">
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

            <motion.p
              key={currentExplanation}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-sm text-slate-700"
            >
              {currentExplanation}
            </motion.p>
          </motion.div>

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="rounded-2xl glass p-5">
              <h3 className="text-sm font-semibold text-slate-950 mb-4">Live Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <GitCompare className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-950">{comparisons}</p>
                  <p className="text-[10px] text-muted-foreground">Comparisons</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <ArrowLeftRight className="w-4 h-4 text-red-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-950">{swaps}</p>
                  <p className="text-[10px] text-muted-foreground">Swaps</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <SkipForward className="w-4 h-4 text-lavender mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-950">{passes}</p>
                  <p className="text-[10px] text-muted-foreground">Passes</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <Trophy className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-950">{sorted ? '✓' : '...'}</p>
                  <p className="text-[10px] text-muted-foreground">Status</p>
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className="rounded-2xl glass p-5">
              <h3 className="text-sm font-semibold text-slate-950 mb-3">Complexity Analysis</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-muted-foreground">Worst Case</span>
                  <span className="text-red-400 font-mono font-semibold">O(n²)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-muted-foreground">Best Case</span>
                  <span className="text-emerald-400 font-mono font-semibold">O(n)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-muted-foreground">Average</span>
                  <span className="text-yellow-400 font-mono font-semibold">O(n²)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-muted-foreground">Space</span>
                  <span className="text-lavender font-mono font-semibold">O(1)</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl glass p-5">
              <h3 className="text-sm font-semibold text-slate-950 mb-4 flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-emerald-400" />
                Algorithm Comparison
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-muted-foreground">Bubble worst</p>
                  <p className="text-lg font-bold text-red-400">{algorithmComparison.bubbleWorst}</p>
                  <p className="text-[10px] text-muted-foreground">comparisons</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-[10px] text-muted-foreground">n log n est.</p>
                  <p className="text-lg font-bold text-emerald-400">{algorithmComparison.nLogN}</p>
                  <p className="text-[10px] text-muted-foreground">steps</p>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <p className="text-xs text-emerald-600 font-semibold">{algorithmComparison.speedup}x fewer comparison-scale steps</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  On {algorithmComparison.n} values, efficient production sort routines are already ahead; the gap grows fast as inventory records scale.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl glass p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-950 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  Algorithm Race
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Run four algorithms on the same current array and compare real work counts.</p>
              </div>
              <button
                type="button"
                onClick={runVisualAlgorithmRace}
                disabled={raceRunning || sorting}
                className="px-4 py-2 rounded-lg bg-[#062c26] text-white text-xs font-semibold hover:bg-[#0b3d35] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {raceRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {raceRunning ? 'Racing...' : 'Live Race'}
              </button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {raceVisualizers.map(visualizer => {
                const visualMax = Math.max(...visualizer.values, 1)
                return (
                  <div key={visualizer.name} className="rounded-2xl border border-[#062c26]/10 bg-white/70 p-4 shadow-[0_14px_38px_rgba(6,44,38,0.08)]">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase text-[#062c26]">{visualizer.name}</p>
                        <p className="mt-1 text-[10px] font-semibold text-slate-500">{visualizer.status}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-black ${visualizer.sorted ? 'bg-[#d9fee8] text-[#062c26]' : 'bg-[#f8ff5a] text-[#062c26]'}`}>
                        {visualizer.sorted ? 'DONE' : 'LIVE'}
                      </span>
                    </div>
                    <div className="flex h-36 items-end gap-1.5 rounded-xl bg-[#d9fee8]/45 px-2 py-3">
                      {visualizer.values.map((value, index) => (
                        <motion.div
                          key={`${visualizer.name}-${index}`}
                          layout
                          animate={{ height: `${(value / visualMax) * 100}%` }}
                          className={`relative min-w-3 flex-1 rounded-t-md ${visualizer.active.includes(index) ? 'bg-[#f8ff5a]' : visualizer.sorted ? 'bg-[#10c98b]' : 'bg-[#062c26]'}`}
                        />
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600">
                      <span>Comparisons: <b className="text-[#062c26]">{visualizer.comparisons}</b></span>
                      <span>Moves: <b className="text-[#062c26]">{visualizer.swaps}</b></span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="overflow-x-auto rounded-xl border-0 bg-white/60 sm:border sm:border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-muted-foreground">
                    <tr>
                      {['Algorithm', 'Best', 'Avg', 'Worst', 'Space', 'Comparisons', 'Swaps', 'Time'].map(header => (
                        <th key={header} className="px-3 py-2 text-left font-medium">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(raceResults.length ? raceResults : [
                      { name: 'Bubble Sort', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', comparisons: 0, swaps: 0, timeMs: 0 },
                      { name: 'Selection Sort', best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', comparisons: 0, swaps: 0, timeMs: 0 },
                      { name: 'Insertion Sort', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', comparisons: 0, swaps: 0, timeMs: 0 },
                      { name: 'Merge Sort', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', comparisons: 0, swaps: 0, timeMs: 0 },
                    ]).map(result => (
                      <tr key={result.name} className="border-t border-slate-200">
                        <td className="px-3 py-2 font-semibold text-slate-950">{result.name}</td>
                        <td className="px-3 py-2 font-mono text-emerald-500">{result.best}</td>
                        <td className="px-3 py-2 font-mono text-gold">{result.average}</td>
                        <td className="px-3 py-2 font-mono text-red-400">{result.worst}</td>
                        <td className="px-3 py-2 font-mono text-lavender">{result.space}</td>
                        <td className="px-3 py-2 text-slate-700">{result.comparisons || '-'}</td>
                        <td className="px-3 py-2 text-slate-700">{result.swaps || '-'}</td>
                        <td className="px-3 py-2 text-slate-700">{result.timeMs ? `${result.timeMs.toFixed(2)}ms` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-64 rounded-xl border-0 bg-slate-50/85 p-2 sm:h-72 sm:border sm:border-slate-200 sm:p-3">
                <p className="text-[10px] text-muted-foreground mb-2">Comparisons vs Swaps</p>
                {raceResults.length ? (
                  <ResponsiveContainer width="100%" height="92%">
                    <BarChart data={raceResults}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 12 }} />
                      <Bar dataKey="comparisons" fill="#7c3aed" radius={[5, 5, 0, 0]} />
                      <Bar dataKey="swaps" fill="#d4a574" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Click Race to fill the comparison chart.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Python Code & Explanation */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl glass p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-950 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Python Implementation
              </h3>
              <motion.button
                onClick={runPythonCode}
                disabled={!pyodide || pyodideRunning || pyodideLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              >
                {pyodideRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {pyodideLoading ? 'Loading...' : 'Run'}
              </motion.button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-56 w-full rounded-lg border-0 bg-white px-3 py-3 text-xs font-mono text-slate-800 resize-none focus:outline-none sm:h-64 sm:border sm:border-slate-200 sm:p-4"
              spellCheck={false}
            />
            {output && (
              <div className="mt-3 max-h-32 overflow-y-auto rounded-lg border-0 bg-slate-50/85 p-3 text-xs font-mono text-slate-600 sm:border sm:border-slate-200">
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
            <h3 className="text-sm font-semibold text-slate-950 mb-4">How Bubble Sort Works</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-yellow-400 mb-1 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Step 1: Compare
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Starting from the first element, compare each pair of adjacent elements. If the left element is greater than the right, they need to be swapped.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3 h-3" /> Step 2: Swap
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  When a larger element is found before a smaller one, swap their positions. This &quot;bubbles&quot; the larger element toward the end of the array.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
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
