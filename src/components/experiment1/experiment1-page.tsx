'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/app-store'
import { usePyodide } from '@/hooks/use-pyodide'
import { BarChart3, Play, Upload, ChevronRight, Database, Filter, Group, TrendingUp, AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const sampleCSV = `Product,Brand,Price,Quantity
T-Shirt,Nike,1200,5
Jeans,Levis,2500,3
Jacket,Puma,3500,2
Socks,Nike,300,10
Shirt,Levis,1800,4
Hoodie,Puma,2200,6
Cap,Nike,800,8
Trousers,Levis,1500,3
Sneakers,Nike,4500,2
Shorts,Puma,900,7
Dress,Levis,3200,1
Scarf,Nike,600,5
Gloves,Puma,400,4
Vest,Levis,1200,3
Belt,Nike,700,6
Watch,Puma,5500,1
Boots,Levis,3800,2
Hat,Nike,500,9
Pants,Puma,1600,4
Tie,Levis,900,3`

function getDefaultCode(): string {
  return `import pandas as pd
from io import StringIO

# Load the CSV data
csv_text = """Product,Brand,Price,Quantity
T-Shirt,Nike,1200,5
Jeans,Levis,2500,3
Jacket,Puma,3500,2
Socks,Nike,300,10
Shirt,Levis,1800,4
Hoodie,Puma,2200,6
Cap,Nike,800,8
Trousers,Levis,1500,3
Sneakers,Nike,4500,2
Shorts,Puma,900,7
Dress,Levis,3200,1
Scarf,Nike,600,5
Gloves,Puma,400,4
Vest,Levis,1200,3
Belt,Nike,700,6
Watch,Puma,5500,1
Boots,Levis,3800,2
Hat,Nike,500,9
Pants,Puma,1600,4
Tie,Levis,900,3"""

data = StringIO(csv_text)
df = pd.read_csv(data)

# Display the dataset
print("=== Original Dataset ===")
print(df.to_string())
print(f"\\nShape: {df.shape}")

# Filter: Price > 1000
filtered = df[df['Price'] > 1000]
print("\\n=== Filtered (Price > 1000) ===")
print(filtered.to_string())

# Group by Brand and aggregate Quantity
grouped = filtered.groupby('Brand')['Quantity'].sum().reset_index()
grouped.columns = ['Brand', 'TotalQuantity']
print("\\n=== Grouped by Brand ===")
print(grouped.to_string())

print("\\n__CHART_DATA__")
import json
print(json.dumps(grouped.to_dict('records')))
`
}

const pipelineSteps = [
  { id: 'csv', label: 'CSV Upload', icon: <Upload className="w-4 h-4" />, description: 'Raw data loaded into memory' },
  { id: 'dataframe', label: 'DataFrame', icon: <Database className="w-4 h-4" />, description: 'Structured as pandas DataFrame' },
  { id: 'filter', label: 'Filter', icon: <Filter className="w-4 h-4" />, description: 'Rows filtered by condition' },
  { id: 'groupby', label: 'GroupBy', icon: <Group className="w-4 h-4" />, description: 'Grouped by Brand column' },
  { id: 'aggregate', label: 'Aggregate', icon: <TrendingUp className="w-4 h-4" />, description: 'Quantities summed per brand' },
  { id: 'chart', label: 'Chart', icon: <BarChart3 className="w-4 h-4" />, description: 'Visual representation generated' },
]

const explanationSteps = [
  { step: 1, title: 'CSV Loaded', desc: 'Raw CSV data is read into a pandas DataFrame using read_csv(). Each row becomes a record with typed columns.' },
  { step: 2, title: 'Data Filtered', desc: 'Boolean indexing filters rows where Price > 1000. Pandas evaluates the condition for each row, keeping only matches.' },
  { step: 3, title: 'Data Grouped', desc: 'groupby("Brand") combines rows with the same Brand value into groups. Each group contains all rows for that brand.' },
  { step: 4, title: 'Aggregated', desc: 'sum() aggregates the Quantity values within each group, producing a single total per brand.' },
  { step: 5, title: 'Visualized', desc: 'The aggregated results are rendered as a bar chart, transforming numerical data into visual patterns.' },
]

// Pre-compute table data from sample CSV
const sampleTableData = (() => {
  const lines = sampleCSV.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const row: Record<string, string | number> = {}
    headers.forEach((h, i) => {
      const val = values[i]?.trim() || ''
      const num = Number(val)
      row[h.trim()] = isNaN(num) ? val : num
    })
    return row
  })
})()

import { UsageThoughts } from '@/components/ui/usage-thoughts'

export function Experiment1Page() {
  const { setCurrentPage } = useAppStore()
  const { pyodide, loading: pyodideLoading, runCode, output, isRunning } = usePyodide()
  const [code, setCode] = useState(getDefaultCode)
  const [activePipelineStep, setActivePipelineStep] = useState(0)
  const [chartData, setChartData] = useState<Array<{ Brand: string; TotalQuantity: number }>>([])
  const [thoughts, setThoughts] = useState<string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const handleRun = useCallback(async () => {
    if (!pyodide || isRunning) return

    setChartData([])
    setThoughts([])
    setIsThinking(true)
    setActivePipelineStep(0)

    const runPipeline = async () => {
      for (let i = 0; i < pipelineSteps.length; i++) {
        await new Promise(r => setTimeout(r, 800))
        setActivePipelineStep(i + 1)
        if (i < explanationSteps.length) {
          setThoughts(prev => [...prev, explanationSteps[i].desc])
        }
      }
    }

    const runExecution = async () => {
      const result = await runCode(code)
      try {
        const chartMatch = result.match(/__CHART_DATA__\n([\s\S]*?)(?:\n|$)/)
        if (chartMatch) {
          const jsonStr = chartMatch[1].trim()
          const parsed = JSON.parse(jsonStr)
          if (Array.isArray(parsed)) {
            setChartData(parsed.map((item: Record<string, unknown>) => ({
              Brand: String(item.Brand || item.brand || ''),
              TotalQuantity: Number(item.TotalQuantity || item.TotalQty || item.totalquantity || 0),
            })))
          }
        }
      } catch {
        // Chart data extraction failed
      }
    }

    await Promise.all([runPipeline(), runExecution()])
    setIsThinking(false)
  }, [pyodide, code, isRunning, runCode])

  const chartColors = ['#a78bfa', '#7c3aed', '#d4a574', '#60a5fa', '#34d399']

  // Scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(167,139,250,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.6) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(rgba(167,139,250,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.8) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
              }}
            />
          </motion.div>

          {/* Orbs */}
          <motion.div
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'rgba(167,139,250,0.08)' }}
          />
          <motion.div
            animate={{ x: [0, -30, 20, 0], y: [0, 40, -20, 0], scale: [1, 1.15, 0.9, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 -left-20 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: 'rgba(124,58,237,0.06)' }}
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
              className="text-xs text-muted-foreground hover:text-cream transition-colors mb-6 flex items-center gap-1"
            >
              ← Back to Home
            </motion.button>
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-10 h-10 rounded-xl bg-lavender/10 flex items-center justify-center text-lavender"
              >
                <BarChart3 className="w-5 h-5" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-3xl md:text-4xl font-bold text-cream"
                >
                  Data Analysis &amp; Visualization
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-sm text-muted-foreground"
                >
                  Experiment 1 — Transform raw data into visual insights
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

      {/* Animated Data Pipeline */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {pipelineSteps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0.3, scale: 0.9 }}
                  animate={{
                    opacity: activePipelineStep > i ? 1 : 0.3,
                    scale: activePipelineStep > i ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-500 ${
                    activePipelineStep > i
                      ? 'bg-lavender/10 text-lavender glow-lavender'
                      : 'glass text-muted-foreground'
                  }`}
                >
                  <span className={activePipelineStep > i ? 'text-lavender' : ''}>{step.icon}</span>
                  <span className="font-medium">{step.label}</span>
                </motion.div>
                {i < pipelineSteps.length - 1 && (
                  <motion.div
                    animate={{
                      opacity: activePipelineStep > i ? 1 : 0.2,
                      color: activePipelineStep > i ? '#a78bfa' : '#666',
                    }}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Dataset Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl glass p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-cream flex items-center gap-2">
                  <Database className="w-4 h-4 text-lavender" />
                  Dataset Preview
                </h3>
                <span className="text-[10px] text-muted-foreground">{sampleTableData.length} rows</span>
              </div>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-white/[0.04]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Product', 'Brand', 'Price', 'Quantity'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleTableData.map((row, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-3 py-1.5 text-cream/80">{row.Product}</td>
                        <td className="px-3 py-1.5">
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-lavender/10 text-lavender">
                            {row.Brand}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-cream/80">₹{row.Price}</td>
                        <td className="px-3 py-1.5 text-cream/80">{row.Quantity}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Python Code Editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl glass p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-cream flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Python Editor
                </h3>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCode(getDefaultCode())}
                    className="p-1.5 rounded-lg hover:bg-white/[0.04] text-muted-foreground hover:text-cream transition-colors"
                    title="Reset Code"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button
                    onClick={handleRun}
                    disabled={!pyodide || isRunning || pyodideLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                      isRunning
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gradient-to-r from-lavender to-lavender-glow text-navy glow-lavender hover:shadow-[0_0_30px_rgba(167,139,250,0.3)]'
                    }`}
                  >
                    {isRunning ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running...</>
                    ) : pyodideLoading ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading Python...</>
                    ) : (
                      <><Play className="w-3.5 h-3.5" /> Run Code</>
                    )}
                  </motion.button>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border border-white/[0.04]">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-72 p-4 bg-[#0d1130] text-cream/90 text-xs font-mono resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Output Console */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl glass p-5"
            >
              <h3 className="text-sm font-semibold text-cream mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gold" />
                Output Console
              </h3>
              <div
                ref={outputRef}
                className="max-h-48 overflow-y-auto rounded-lg bg-[#0a0d20] border border-white/[0.04] p-3 text-xs font-mono text-cream/70"
              >
                {output || (
                  <span className="text-muted-foreground/50 italic">Run the code to see output...</span>
                )}
              </div>
            </motion.div>

            {/* Chart Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl glass p-5"
            >
              <h3 className="text-sm font-semibold text-cream mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-lavender" />
                Visualization
              </h3>
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={40}>
                      <XAxis dataKey="Brand" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: '#161633',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                          color: '#faf5eb',
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="TotalQuantity" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={index} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground/30 text-sm">
                    Run code to generate chart
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Complexity & Learning Notes */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl glass p-6"
          >
            <h3 className="text-sm font-semibold text-cream mb-4">Learning Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <p className="text-xs font-semibold text-gold mb-1">Why Pandas?</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Pandas provides efficient data structures (DataFrame, Series) optimized for tabular data operations like filtering, grouping, and aggregation.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <p className="text-xs font-semibold text-lavender mb-1">Why GroupBy?</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  GroupBy is the split-apply-combine pattern. It splits data into groups, applies a function to each, then combines results — essential for summarization.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <p className="text-xs font-semibold text-emerald-400 mb-1">Why Visualize?</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Charts transform numerical summaries into visual patterns humans can quickly interpret, revealing trends, outliers, and distributions invisible in raw numbers.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
