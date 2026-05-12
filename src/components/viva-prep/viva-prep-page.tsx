'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/app-store'
import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, BarChart3, Layers, ArrowUpDown, Lightbulb, Target, HelpCircle } from 'lucide-react'

interface QAPair {
  question: string
  answer: string
  category: string
}

const vivaQuestions: Record<string, QAPair[]> = {
  'Data Analysis': [
    { question: 'What is pandas and why is it used for data analysis?', answer: 'Pandas is a Python library providing high-performance data structures (DataFrame, Series) for data manipulation and analysis. It offers efficient operations for filtering, grouping, aggregation, and transformation of structured data.', category: 'Data Analysis' },
    { question: 'How does groupby() work internally?', answer: 'groupby() follows the split-apply-combine pattern: it splits data into groups based on a key, applies a function (like sum, mean) to each group independently, then combines the results into a new DataFrame.', category: 'Data Analysis' },
    { question: 'What is the difference between filtering and grouping?', answer: 'Filtering selects rows based on conditions (boolean indexing), reducing the dataset. Grouping organizes rows into categories based on column values, preparing them for aggregation — it doesn\'t reduce rows until an aggregation function is applied.', category: 'Data Analysis' },
    { question: 'Why is data visualization important?', answer: 'Visualization transforms numerical data into visual patterns that humans can quickly interpret. It reveals trends, outliers, distributions, and relationships that are invisible in raw numbers, enabling faster and more accurate decision-making.', category: 'Data Analysis' },
    { question: 'Explain the data pipeline from CSV to chart.', answer: 'CSV → read_csv() creates DataFrame → filtering with boolean indexing → groupby() organizes by category → aggregation (sum/mean) produces summary → chart renders the summary visually. Each step transforms the data progressively toward insight.', category: 'Data Analysis' },
  ],
  'Stack Data Structure': [
    { question: 'What is a stack and how does it work?', answer: 'A stack is a linear data structure following LIFO (Last In, First Out) principle. Elements are added (pushed) and removed (popped) from the same end called the top. The last element inserted is the first one to be removed.', category: 'Stack Data Structure' },
    { question: 'What is the time complexity of push and pop?', answer: 'Both push and pop operations are O(1) — constant time. This is because they only operate on the top element; no traversal of the entire structure is needed regardless of the stack size.', category: 'Stack Data Structure' },
    { question: 'Give real-world applications of stacks.', answer: '1) Browser back/forward navigation, 2) Undo/Redo in text editors, 3) Function call stack in programming languages, 4) Expression evaluation and syntax parsing, 5) Backtracking algorithms (DFS, maze solving).', category: 'Stack Data Structure' },
    { question: 'What happens if you pop from an empty stack?', answer: 'It causes a stack underflow error. In Python using lists, pop() on an empty list raises an IndexError. Good implementations check is_empty() before popping to prevent this.', category: 'Stack Data Structure' },
    { question: 'How is a stack different from a queue?', answer: 'Stack follows LIFO (last in, first out) — operations at one end only. Queue follows FIFO (first in, first out) — insertions at rear, deletions at front. Stack is like a pile of plates; queue is like a line at a counter.', category: 'Stack Data Structure' },
  ],
  'Bubble Sort': [
    { question: 'Explain the bubble sort algorithm.', answer: 'Bubble sort repeatedly traverses the array, comparing adjacent elements and swapping them if they\'re in wrong order. After each pass, the largest unsorted element "bubbles up" to its correct position. The process repeats until no swaps are needed.', category: 'Bubble Sort' },
    { question: 'What is the time complexity of bubble sort?', answer: 'Worst case: O(n²) — array is reverse sorted, requiring maximum comparisons and swaps. Best case: O(n) — array is already sorted (with optimization to detect no swaps). Average case: O(n²). Space complexity: O(1) — in-place sorting.', category: 'Bubble Sort' },
    { question: 'Why is bubble sort inefficient for large datasets?', answer: 'O(n²) complexity means comparisons grow quadratically with input size. For 10,000 elements, that\'s ~100 million comparisons. Merge sort (O(n log n)) would only need ~140,000 operations. Bubble sort is educational, not practical.', category: 'Bubble Sort' },
    { question: 'What optimization can be applied to bubble sort?', answer: 'Early termination: if no swaps occur during a pass, the array is already sorted and we can stop. This improves best case to O(n). Also, after each pass i, the last i elements are sorted, so we can reduce the inner loop range.', category: 'Bubble Sort' },
    { question: 'How does Python\'s built-in sort() compare?', answer: 'Python uses Timsort — a hybrid of merge sort and insertion sort — with O(n log n) time complexity. It\'s adaptive (takes advantage of existing order), stable, and far more efficient than bubble sort for any practical dataset.', category: 'Bubble Sort' },
  ],
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Data Analysis': <BarChart3 className="w-4 h-4" />,
  'Stack Data Structure': <Layers className="w-4 h-4" />,
  'Bubble Sort': <ArrowUpDown className="w-4 h-4" />,
}

const categoryColors: Record<string, string> = {
  'Data Analysis': 'text-lavender',
  'Stack Data Structure': 'text-gold',
  'Bubble Sort': 'text-emerald-400',
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
}

export function VivaPrepPage() {
  const { setCurrentPage } = useAppStore()
  const [expandedQ, setExpandedQ] = useState<string | null>(null)

  const toggleQuestion = (key: string) => {
    setExpandedQ(prev => prev === key ? null : key)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-6 pt-16 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 22, repeat: Infinity }}
            className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gold/[0.03] blur-[100px]"
          />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <button
              onClick={() => setCurrentPage('home')}
              className="text-xs text-muted-foreground hover:text-cream transition-colors mb-6"
            >
              ← Back to Home
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-cream">Viva Preparation</h1>
                <p className="text-sm text-muted-foreground">Key questions and answers for each experiment</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex items-center gap-3 p-4 rounded-xl glass"
          >
            <Lightbulb className="w-5 h-5 text-gold flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click on each question to reveal the answer. These are commonly asked viva questions covering 
              data analysis concepts, stack operations, and sorting algorithms.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Questions by Category */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {Object.entries(vivaQuestions).map(([category, questions], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + catIndex * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={categoryColors[category]}>{categoryIcons[category]}</span>
                <h2 className="text-lg font-semibold text-cream">{category}</h2>
                <span className="text-[10px] text-muted-foreground/50">{questions.length} questions</span>
              </div>

              <div className="space-y-2">
                {questions.map((qa, qi) => {
                  const key = `${category}-${qi}`
                  const isExpanded = expandedQ === key
                  return (
                    <motion.div
                      key={key}
                      className="rounded-xl glass overflow-hidden"
                      whileHover={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <button
                        onClick={() => toggleQuestion(key)}
                        className="w-full flex items-center gap-3 p-4 text-left"
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isExpanded ? 'bg-lavender/20 text-lavender' : 'bg-white/[0.03] text-muted-foreground'
                        }`}>
                          {qi + 1}
                        </div>
                        <span className="flex-1 text-sm text-cream/80 font-medium">{qa.question}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-4 pb-4 pl-13">
                              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03] text-xs text-muted-foreground leading-relaxed">
                                {qa.answer}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Tips */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-xl font-bold text-cream mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-gold" />
              Quick Viva Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: <HelpCircle className="w-4 h-4" />, tip: 'Always explain with an example — use the visualization as reference' },
                { icon: <Target className="w-4 h-4" />, tip: 'Start with the concept, then explain implementation, then discuss complexity' },
                { icon: <Lightbulb className="w-4 h-4" />, tip: 'For sorting: mention best/worst/average cases and why they differ' },
                { icon: <BookOpen className="w-4 h-4" />, tip: 'For stack: always mention LIFO and real-world analogies (plates, browser history)' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="flex gap-3 p-4 rounded-xl glass"
                >
                  <span className="text-gold/60 flex-shrink-0">{item.icon}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            Viva Preparation Guide — ADDS Interactive Experiment Lab
          </p>
        </div>
      </footer>
    </div>
  )
}
