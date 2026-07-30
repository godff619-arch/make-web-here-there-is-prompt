import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Code2, Image, Search, FileText, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const suggestions = [
  { icon: Sparkles, label: 'Brainstorm ideas', prompt: 'Help me brainstorm creative ideas for a tech startup in AI education' },
  { icon: Code2, label: 'Write code', prompt: 'Write a Python function that implements a binary search tree with insert, delete, and search' },
  { icon: Image, label: 'Create an image', prompt: 'Describe a futuristic city at sunset with flying cars and neon lights' },
  { icon: FileText, label: 'Summarize text', prompt: 'Summarize the key points of this article and explain the main argument' },
  { icon: Search, label: 'Research a topic', prompt: 'Explain quantum computing in simple terms and its potential applications' },
  { icon: MessageSquare, label: 'Write an email', prompt: 'Draft a professional email to schedule a meeting with a potential client' },
]

export function WelcomeScreen({ onSuggestion }: { onSuggestion: (prompt: string) => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-3">How can I help you today?</h1>
          <p className="text-muted-foreground mb-8">Ask anything, generate code, create images, or analyze documents</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {suggestions.map((s, i) => (
            <motion.button
              key={s.label}
              className="group flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all text-left"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestion(s.prompt)}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{s.prompt.slice(0, 60)}...</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
