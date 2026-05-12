'use client'

import { ChangeEvent, Dispatch, SetStateAction, useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/app-store'
import { usePyodide } from '@/hooks/use-pyodide'
import { BarChart3, Play, Upload, Download, ChevronRight, Database, Filter, Group, TrendingUp, AlertCircle, Loader2, RotateCcw, CopyX, ArrowUpDown, PieChart as PieChartIcon, Activity as ActivityIcon } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

const sampleCSV = `Product,Brand,Price,Quantity,Category,Rating,Discount,InStock
T-Shirt,Nike,899,18,Apparel,4.4,10,Yes
Sneakers,Adidas,2499,9,Footwear,4.7,15,Yes
Jacket,Puma,1799,6,Apparel,4.2,5,Yes
Shorts,Nike,599,24,Apparel,4.0,20,Yes
Running Shoes,Nike,3299,7,Footwear,4.8,12,Yes
Hoodie,Adidas,1299,13,Apparel,4.5,18,Yes
Track Pants,Puma,999,16,Apparel,4.1,8,Yes
Sports Bra,Nike,799,14,Apparel,4.3,10,Yes
Cap,Adidas,499,32,Accessories,3.9,25,Yes
Socks,Puma,299,45,Accessories,4.0,5,Yes
Backpack,Nike,2199,11,Accessories,4.6,14,Yes
Slides,Adidas,1099,20,Footwear,4.2,22,Yes
Training Tee,Puma,699,27,Apparel,4.1,18,Yes
Windbreaker,Nike,2599,5,Apparel,4.5,7,No
Yoga Mat,Adidas,1499,12,Accessories,4.7,10,Yes
Gym Bag,Puma,1899,8,Accessories,4.3,16,Yes
Basketball Shoes,Nike,4599,4,Footwear,4.9,5,No
Compression Tights,Adidas,1599,10,Apparel,4.4,12,Yes
Training Gloves,Puma,799,22,Accessories,4.0,30,Yes
Rain Jacket,Nike,3499,3,Apparel,4.6,8,No
Football Boots,Adidas,3899,6,Footwear,4.8,11,Yes
Running Shorts,Puma,749,19,Apparel,4.2,15,Yes
Duffel Bag,Nike,2799,7,Accessories,4.5,9,Yes
Tennis Shoes,Adidas,2999,5,Footwear,4.4,13,Yes
Training Socks,Puma,399,38,Accessories,3.8,20,Yes`

function getDefaultCode(csvText = sampleCSV): string {
  return `import pandas as pd
from io import StringIO

# Load the CSV data
csv_text = ${JSON.stringify(csvText)}

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

# Group by Brand and aggregate Quantity + Revenue
df['Revenue'] = df['Price'] * df['Quantity']
grouped = df.groupby('Brand').agg(
    TotalQuantity=('Quantity', 'sum'),
    TotalRevenue=('Revenue', 'sum')
).reset_index().sort_values('TotalRevenue', ascending=False)
print("\\n=== Grouped by Brand ===")
print(grouped.to_string())

if 'Category' in df.columns:
    category_stats = df.groupby('Category').agg(
        TotalQuantity=('Quantity', 'sum'),
        TotalRevenue=('Revenue', 'sum')
    ).reset_index()
    print("\\n=== Category Performance ===")
    print(category_stats.to_string())

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

type CsvCell = string | number
type CsvRow = Record<string, CsvCell>
type ChartType = 'bar' | 'line' | 'area' | 'pie'
type NumericRange = [number, number]

function parseCsvRows(csvText: string): { headers: string[]; rows: CsvRow[] } {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = lines[0].split(',').map(header => header.trim())
  const rows = lines.slice(1).map(line => {
    const values = line.split(',')
    const row: CsvRow = {}
    headers.forEach((h, i) => {
      const val = values[i]?.trim() || ''
      const num = val === '' ? NaN : Number(val)
      row[h] = isNaN(num) ? val : num
    })
    return row
  })
  return { headers, rows }
}

function rowsToCsv(headers: string[], rows: CsvRow[]): string {
  return [
    headers.join(','),
    ...rows.map(row => headers.map(header => String(row[header] ?? '')).join(',')),
  ].join('\n')
}

import { UsageThoughts } from '@/components/ui/usage-thoughts'

export function Experiment1Page() {
  const { setCurrentPage } = useAppStore()
  const { pyodide, loading: pyodideLoading, runCode, output, isRunning } = usePyodide()
  const [csvContent, setCsvContent] = useState(sampleCSV)
  const [code, setCode] = useState(() => getDefaultCode(sampleCSV))
  const [activePipelineStep, setActivePipelineStep] = useState(0)
  const [chartData, setChartData] = useState<Array<{ Brand: string; TotalQuantity: number; TotalRevenue: number }>>([])
  const [thoughts, setThoughts] = useState<string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [chartMetric, setChartMetric] = useState<'TotalRevenue' | 'TotalQuantity'>('TotalRevenue')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [filterColumn, setFilterColumn] = useState('Brand')
  const [filterValue, setFilterValue] = useState('')
  const [sortColumn, setSortColumn] = useState('Price')
  const [sortAscending, setSortAscending] = useState(false)
  const [dataLog, setDataLog] = useState<string[]>(['Dataset loaded. Ready for DataFrame operations.'])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<NumericRange>([0, 5000])
  const [quantityRange, setQuantityRange] = useState<NumericRange>([0, 50])
  const [ratingRange, setRatingRange] = useState<NumericRange>([0, 5])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const { headers, rows: tableRows } = parseCsvRows(csvContent)

  const numericHeaders = useMemo(() => (
    headers.filter(header => tableRows.some(row => typeof row[header] === 'number'))
  ), [headers, tableRows])

  const cleanStats = useMemo(() => {
    const missing = tableRows.reduce((total, row) => (
      total + headers.filter(header => String(row[header] ?? '') === '').length
    ), 0)
    const duplicates = tableRows.length - new Set(tableRows.map(row => JSON.stringify(row))).size
    const revenue = tableRows.reduce((total, row) => {
      const price = Number(row.Price ?? 0)
      const quantity = Number(row.Quantity ?? 0)
      return total + price * quantity
    }, 0)
    return { missing, duplicates, revenue }
  }, [headers, tableRows])

  const brandOptions = useMemo(() => (
    Array.from(new Set(tableRows.map(row => String(row.Brand ?? '')).filter(Boolean))).sort()
  ), [tableRows])

  const categoryOptions = useMemo(() => (
    Array.from(new Set(tableRows.map(row => String(row.Category ?? '')).filter(Boolean))).sort()
  ), [tableRows])

  const displayRows = useMemo(() => {
    const filtered = tableRows.filter(row => {
      const textMatches = filterValue.trim()
        ? String(row[filterColumn] ?? '').toLowerCase().includes(filterValue.toLowerCase())
        : true
      const brandMatches = selectedBrands.length === 0 || selectedBrands.includes(String(row.Brand ?? ''))
      const categoryMatches = selectedCategories.length === 0 || selectedCategories.includes(String(row.Category ?? ''))
      const price = Number(row.Price ?? 0)
      const quantity = Number(row.Quantity ?? 0)
      const rating = Number(row.Rating ?? 0)
      return (
        textMatches &&
        brandMatches &&
        categoryMatches &&
        price >= priceRange[0] &&
        price <= priceRange[1] &&
        quantity >= quantityRange[0] &&
        quantity <= quantityRange[1] &&
        rating >= ratingRange[0] &&
        rating <= ratingRange[1]
      )
    })

    if (!sortColumn) return filtered
    return [...filtered].sort((a, b) => {
      const left = a[sortColumn]
      const right = b[sortColumn]
      const result = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left ?? '').localeCompare(String(right ?? ''))
      return sortAscending ? result : -result
    })
  }, [filterColumn, filterValue, priceRange, quantityRange, ratingRange, selectedBrands, selectedCategories, sortAscending, sortColumn, tableRows])

  const activeFilterCount = useMemo(() => (
    (filterValue.trim() ? 1 : 0) +
    selectedBrands.length +
    selectedCategories.length +
    (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0) +
    (quantityRange[0] > 0 || quantityRange[1] < 50 ? 1 : 0) +
    (ratingRange[0] > 0 || ratingRange[1] < 5 ? 1 : 0)
  ), [filterValue, priceRange, quantityRange, ratingRange, selectedBrands, selectedCategories])

  const filteredRevenue = useMemo(() => displayRows.reduce((total, row) => (
    total + Number(row.Price ?? 0) * Number(row.Quantity ?? 0) * (1 - Number(row.Discount ?? 0) / 100)
  ), 0), [displayRows])

  const averagePrice = useMemo(() => (
    displayRows.length ? displayRows.reduce((total, row) => total + Number(row.Price ?? 0), 0) / displayRows.length : 0
  ), [displayRows])

  const categoryData = useMemo(() => categoryOptions.map(category => ({
    name: category,
    value: displayRows.filter(row => String(row.Category ?? '') === category).length,
  })).filter(item => item.value > 0), [categoryOptions, displayRows])

  const histogramData = useMemo(() => {
    const buckets = [
      { name: '0-999', min: 0, max: 999 },
      { name: '1k-1.9k', min: 1000, max: 1999 },
      { name: '2k-2.9k', min: 2000, max: 2999 },
      { name: '3k+', min: 3000, max: Infinity },
    ]
    return buckets.map(bucket => ({
      name: bucket.name,
      count: displayRows.filter(row => {
        const price = Number(row.Price ?? 0)
        return price >= bucket.min && price <= bucket.max
      }).length,
    }))
  }, [displayRows])

  const topBrand = useMemo(() => {
    const totals = displayRows.reduce<Record<string, number>>((acc, row) => {
      const brand = String(row.Brand ?? 'Unknown')
      acc[brand] = (acc[brand] || 0) + Number(row.Price ?? 0) * Number(row.Quantity ?? 0)
      return acc
    }, {})
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
  }, [displayRows])

  const applyRowsToDataset = useCallback((nextRows: CsvRow[], message: string) => {
    const nextCsv = rowsToCsv(headers, nextRows)
    setCsvContent(nextCsv)
    setCode(getDefaultCode(nextCsv))
    setChartData([])
    setDataLog(prev => [message, ...prev].slice(0, 5))
    setThoughts([message])
  }, [headers])

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
              TotalRevenue: Number(item.TotalRevenue || item.Revenue || item.totalrevenue || 0),
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

  const handleFileUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const nextCsv = String(reader.result || '')
      setCsvContent(nextCsv)
      setCode(getDefaultCode(nextCsv))
      setChartData([])
      setDataLog(prev => [`Uploaded ${file.name}. ${parseCsvRows(nextCsv).rows.length} rows available.`, ...prev].slice(0, 5))
      setThoughts([`Loaded ${file.name}. Preview and code updated from the uploaded CSV.`])
    }
    reader.readAsText(file)
    event.target.value = ''
  }, [])

  const handleDownload = useCallback(() => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'garment_sales.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }, [csvContent])

  const resetDataset = useCallback(() => {
    setCsvContent(sampleCSV)
    setCode(getDefaultCode(sampleCSV))
    setChartData([])
    setFilterValue('')
    setSelectedBrands([])
    setSelectedCategories([])
    setPriceRange([0, 5000])
    setQuantityRange([0, 50])
    setRatingRange([0, 5])
    setSortColumn('Price')
    setSortAscending(false)
    setDataLog(prev => ['Reset to the sample garment dataset.', ...prev].slice(0, 5))
    setThoughts(['Restored the sample garment dataset and default analysis code.'])
  }, [])

  const removeMissingRows = useCallback(() => {
    const cleaned = tableRows.filter(row => headers.every(header => String(row[header] ?? '') !== ''))
    applyRowsToDataset(cleaned, `dropna() removed ${tableRows.length - cleaned.length} rows with missing values.`)
  }, [applyRowsToDataset, headers, tableRows])

  const removeDuplicateRows = useCallback(() => {
    const seen = new Set<string>()
    const deduped = tableRows.filter(row => {
      const key = JSON.stringify(row)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    applyRowsToDataset(deduped, `drop_duplicates() removed ${tableRows.length - deduped.length} duplicate rows.`)
  }, [applyRowsToDataset, tableRows])

  const toggleValue = useCallback((value: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value])
  }, [])

  const clearManualFilters = useCallback(() => {
    setFilterValue('')
    setSelectedBrands([])
    setSelectedCategories([])
    setPriceRange([0, 5000])
    setQuantityRange([0, 50])
    setRatingRange([0, 5])
  }, [])

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
      <section className="relative overflow-hidden px-4 pb-10 pt-20 sm:px-6 sm:pb-12 lg:px-8">
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

        <div className="relative mx-auto max-w-[1480px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.button
              onClick={() => setCurrentPage('home')}
              whileHover={{ x: -3 }}
              className="text-xs text-muted-foreground hover:text-slate-950 transition-colors mb-6 flex items-center gap-1"
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
                  className="text-2xl font-bold text-slate-950 sm:text-3xl md:text-4xl"
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
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px]">
          <UsageThoughts thoughts={thoughts} visible={thoughts.length > 0 || isThinking} isThinking={isThinking} />
        </div>
      </section>

      {/* Animated Data Pipeline */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px]">
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
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-6 lg:grid-cols-2">
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
                <h3 className="text-sm font-semibold text-slate-950 flex items-center gap-2">
                  <Database className="w-4 h-4 text-lavender" />
                  Dataset Preview
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{tableRows.length} rows</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground hover:text-lavender transition-colors"
                    title="Upload CSV"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground hover:text-slate-950 transition-colors"
                    title="Download CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={resetDataset}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground hover:text-slate-950 transition-colors"
                    title="Reset Dataset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Rows', value: tableRows.length },
                  { label: 'Columns', value: headers.length },
                  { label: 'Missing', value: cleanStats.missing },
                  { label: 'Revenue', value: `₹${Math.round(cleanStats.revenue).toLocaleString()}` },
                ].map(item => (
                  <div key={item.label} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-950">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-lavender" />
                    <p className="text-xs font-semibold text-slate-950">Manual Filters</p>
                    <span className="px-2 py-0.5 rounded-full bg-lavender/10 text-lavender text-[10px] font-semibold">
                      {activeFilterCount} active
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearManualFilters}
                    className="text-[10px] font-medium text-muted-foreground hover:text-slate-950"
                  >
                    Clear All Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  {[
                    { label: 'Max Price', value: priceRange[1], min: 0, max: 5000, setter: setPriceRange, suffix: '₹' },
                    { label: 'Max Quantity', value: quantityRange[1], min: 0, max: 50, setter: setQuantityRange, suffix: '' },
                    { label: 'Min Rating', value: ratingRange[0], min: 0, max: 5, setter: setRatingRange, suffix: '' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{item.label}</span>
                        <span>{item.suffix}{item.value}</span>
                      </div>
                      <input
                        type="range"
                        min={item.min}
                        max={item.max}
                        step={item.label === 'Min Rating' ? 0.1 : 1}
                        value={item.value}
                        onChange={(event) => {
                          const value = Number(event.target.value)
                          item.setter(prev => item.label === 'Min Rating' ? [value, prev[1]] : [prev[0], value])
                        }}
                        className="w-full accent-violet-600"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {brandOptions.map(brand => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleValue(brand, setSelectedBrands)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                          selectedBrands.includes(brand) ? 'bg-lavender text-white' : 'bg-white border border-slate-200 text-muted-foreground hover:text-lavender'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleValue(category, setSelectedCategories)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                          selectedCategories.includes(category) ? 'bg-gold text-white' : 'bg-white border border-slate-200 text-muted-foreground hover:text-gold'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="max-h-64 overflow-auto rounded-lg border-0 bg-white/55 sm:border sm:border-slate-200">
                <table className="min-w-[720px] w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {headers.map(h => (
                        <th key={h} className="px-3 py-2 text-left text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.slice(0, 20).map((row, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        {headers.map(header => (
                          <td key={header} className="px-3 py-1.5 text-slate-700">
                            {header.toLowerCase() === 'brand' ? (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-lavender/10 text-lavender">
                                {row[header]}
                              </span>
                            ) : header.toLowerCase() === 'price' ? (
                              <>₹{row[header]}</>
                            ) : (
                              row[header]
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {displayRows.length > 20 && (
                  <div className="px-3 py-2 text-center text-[10px] text-muted-foreground">
                    +{displayRows.length - 20} more matching rows
                  </div>
                )}
              </div>
            </motion.div>

            {/* DataFrame Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl glass p-5"
            >
              <h3 className="text-sm font-semibold text-slate-950 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-lavender" />
                DataFrame Controls
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Filter column</label>
                  <select
                    value={filterColumn}
                    onChange={(e) => setFilterColumn(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-950 focus:outline-none focus:border-lavender/40"
                  >
                    {headers.map(header => <option key={header}>{header}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Contains</label>
                  <input
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Try Nike or Apparel"
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-950 focus:outline-none focus:border-lavender/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Sort by</label>
                  <select
                    value={sortColumn}
                    onChange={(e) => setSortColumn(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-950 focus:outline-none focus:border-lavender/40"
                  >
                    {headers.map(header => <option key={header}>{header}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSortAscending(prev => !prev)}
                    className="flex-1 px-3 py-2 rounded-lg bg-lavender/10 text-lavender text-xs font-medium hover:bg-lavender/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {sortAscending ? 'Ascending' : 'Descending'}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  onClick={removeMissingRows}
                  className="px-3 py-2 rounded-lg bg-gold/10 text-gold text-xs font-medium hover:bg-gold/20 transition-colors flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" /> Drop Missing
                </button>
                <button
                  type="button"
                  onClick={removeDuplicateRows}
                  className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                >
                  <CopyX className="w-3.5 h-3.5" /> Remove Duplicates ({cleanStats.duplicates})
                </button>
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
                {dataLog.map((log, index) => (
                  <p key={`${log}-${index}`} className="text-[11px] text-muted-foreground font-mono">{log}</p>
                ))}
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
                <h3 className="text-sm font-semibold text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Python Editor
                </h3>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCode(getDefaultCode(csvContent))}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground hover:text-slate-950 transition-colors"
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
                        : 'bg-gradient-to-r from-lavender to-lavender-glow text-white glow-lavender hover:shadow-[0_0_30px_rgba(167,139,250,0.3)]'
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
              <div className="overflow-hidden rounded-lg border-0 bg-white/60 sm:border sm:border-slate-200">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-72 p-4 bg-white text-slate-800 text-xs font-mono resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { label: 'Filtered Revenue', value: `₹${Math.round(filteredRevenue).toLocaleString()}`, accent: 'text-lavender' },
                { label: 'Avg Price', value: `₹${Math.round(averagePrice).toLocaleString()}`, accent: 'text-gold' },
                { label: 'Top Brand', value: topBrand, accent: 'text-emerald-500' },
                { label: 'Visible Rows', value: `${displayRows.length}/${tableRows.length}`, accent: 'text-slate-950' },
              ].map(card => (
                <div key={card.label} className="rounded-2xl glass p-4">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{card.label}</p>
                  <p className={`text-lg font-bold ${card.accent}`}>{card.value}</p>
                  <div className="mt-3 flex h-5 items-end gap-1">
                    {[0.35, 0.7, 0.5, 0.9, 0.62].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t bg-lavender/20"
                        style={{ height: `${height * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="rounded-2xl glass p-5"
            >
              <h3 className="text-sm font-semibold text-slate-950 mb-4">Filtered Dataset Visuals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-44 rounded-xl border-0 bg-slate-50/85 p-2 sm:border sm:border-slate-200 sm:p-3">
                  <p className="text-[10px] text-muted-foreground mb-2">Category Split</p>
                  <ResponsiveContainer width="100%" height="88%">
                    <PieChart>
                      <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 12 }} />
                      <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="48%" outerRadius="78%" paddingAngle={4}>
                        {categoryData.map((_, index) => (
                          <Cell key={index} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-44 rounded-xl border-0 bg-slate-50/85 p-2 sm:border sm:border-slate-200 sm:p-3">
                  <p className="text-[10px] text-muted-foreground mb-2">Price Distribution</p>
                  <ResponsiveContainer width="100%" height="88%">
                    <BarChart data={histogramData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 12 }} />
                      <Bar dataKey="count" fill="#7c3aed" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="md:col-span-2 h-48 rounded-xl border-0 bg-slate-50/85 p-2 sm:border sm:border-slate-200 sm:p-3">
                  <p className="text-[10px] text-muted-foreground mb-2">Price vs Quantity</p>
                  <ResponsiveContainer width="100%" height="88%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="Price" name="Price" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis dataKey="Quantity" name="Quantity" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 12 }} />
                      <Scatter data={displayRows} fill="#d4a574" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Output Console */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl glass p-5"
            >
              <h3 className="text-sm font-semibold text-slate-950 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gold" />
                Output Console
              </h3>
              <div
                ref={outputRef}
                className="max-h-48 overflow-y-auto rounded-lg border-0 bg-slate-50/85 p-3 text-xs font-mono text-slate-600 sm:border sm:border-slate-200"
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-950 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-lavender" />
                  Visualization
                </h3>
                <div className="flex rounded-lg bg-slate-50 border border-slate-200 p-0.5">
                  {([
                    ['TotalRevenue', 'Revenue'],
                    ['TotalQuantity', 'Quantity'],
                  ] as const).map(([metric, label]) => (
                    <button
                      key={metric}
                      type="button"
                      onClick={() => setChartMetric(metric)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                        chartMetric === metric ? 'bg-white text-lavender shadow-sm' : 'text-muted-foreground hover:text-slate-950'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {([
                  ['bar', BarChart3, 'Bar'],
                  ['line', TrendingUp, 'Line'],
                  ['area', ActivityIcon, 'Area'],
                  ['pie', PieChartIcon, 'Pie'],
                ] as const).map(([type, Icon, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setChartType(type)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors flex items-center gap-1.5 ${
                      chartType === type ? 'bg-lavender/10 text-lavender' : 'bg-slate-50 text-muted-foreground hover:text-slate-950'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="h-56 sm:h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="Brand" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: 12 }} />
                        <Line type="monotone" dataKey={chartMetric} stroke="#a78bfa" strokeWidth={2} dot={{ r: 4, fill: '#a78bfa' }} />
                      </LineChart>
                    ) : chartType === 'area' ? (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="Brand" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: 12 }} />
                        <Area type="monotone" dataKey={chartMetric} stroke="#a78bfa" fill="rgba(167,139,250,0.16)" strokeWidth={2} />
                      </AreaChart>
                    ) : chartType === 'pie' ? (
                      <PieChart>
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: 12 }} />
                        <Pie data={chartData} dataKey={chartMetric} nameKey="Brand" innerRadius="55%" outerRadius="82%" paddingAngle={3}>
                          {chartData.map((_, index) => (
                            <Cell key={index} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    ) : (
                      <BarChart data={chartData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="Brand" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis
                          stroke="#9ca3af"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => chartMetric === 'TotalRevenue' ? `₹${Number(value) / 1000}K` : String(value)}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            color: '#0f172a',
                            fontSize: 12,
                          }}
                          formatter={(value: number) => [
                            chartMetric === 'TotalRevenue' ? `₹${value.toLocaleString()}` : value.toLocaleString(),
                            chartMetric === 'TotalRevenue' ? 'Revenue' : 'Quantity',
                          ]}
                        />
                        <Bar dataKey={chartMetric} radius={[6, 6, 0, 0]}>
                          {chartData.map((_, index) => (
                            <Cell key={index} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
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
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl glass p-6"
          >
            <h3 className="text-sm font-semibold text-slate-950 mb-4">Learning Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-gold mb-1">Why Pandas?</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Pandas provides efficient data structures (DataFrame, Series) optimized for tabular data operations like filtering, grouping, and aggregation.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-lavender mb-1">Why GroupBy?</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  GroupBy is the split-apply-combine pattern. It splits data into groups, applies a function to each, then combines results — essential for summarization.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
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
