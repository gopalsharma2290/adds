'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Loader2 } from 'lucide-react'

interface UsageThoughtsProps {
  thoughts: string[]
  visible: boolean
  isThinking?: boolean
}

export function UsageThoughts({ thoughts, visible, isThinking = false }: UsageThoughtsProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden mb-6"
        >
          <div className="rounded-2xl glass p-5 border-lavender/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-cream flex items-center gap-2">
                <Brain className="w-4 h-4 text-lavender" />
                Usage Thoughts
              </h3>
              {isThinking && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-lavender/10 text-[10px] text-lavender font-medium animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing...
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {thoughts.length === 0 && !isThinking && (
                <p className="text-xs text-muted-foreground/30 italic text-center py-2">
                  No active thoughts...
                </p>
              )}
              {thoughts.map((thought, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3 group"
                >
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-lavender/40 mt-1.5 group-hover:bg-lavender group-hover:scale-125 transition-all duration-300" />
                  <p className="text-xs text-muted-foreground group-hover:text-cream/80 transition-colors leading-relaxed">
                    {thought}
                  </p>
                </motion.div>
              ))}
              {isThinking && thoughts.length < 5 && (
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-lavender/20 mt-1.5" />
                  <div className="h-2 w-1/2 bg-white/[0.03] rounded-full mt-1" />
                </motion.div>
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-gold/40" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40 font-medium">Agentic Insight</span>
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-lavender/20" />
                <div className="w-1 h-1 rounded-full bg-lavender/40" />
                <div className="w-1 h-1 rounded-full bg-lavender/20" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
