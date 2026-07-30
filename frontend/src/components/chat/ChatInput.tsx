import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Send, Square, Paperclip, Image, Mic, Plus, Zap } from 'lucide-react'

interface ChatInputProps {
  onSend: (content: string) => void
  onStop: () => void
  isLoading: boolean
  suggestedModel?: string
}

export function ChatInput({ onSend, onStop, isLoading, suggestedModel }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [value])

  const handleSend = () => {
    if (!value.trim() || isLoading) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border/40 bg-background/80 backdrop-blur-xl p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-lg shadow-background/50 p-2 transition-all focus-within:border-primary/40 focus-within:shadow-primary/5">
          <div className="flex items-center gap-1 pl-2 pb-1.5">
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors" title="Attach file">
              <Paperclip className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors" title="Upload image">
              <Image className="h-4 w-4" />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI..."
            rows={1}
            className="flex-1 resize-none bg-transparent border-0 outline-none text-sm py-2 placeholder:text-muted-foreground/60 min-h-[40px] max-h-[200px]"
            disabled={isLoading}
          />

          <div className="flex items-center gap-1 pr-1 pb-1">
            {suggestedModel && !isLoading && (
              <span className="hidden sm:inline-flex items-center text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                {suggestedModel}
              </span>
            )}
            {isLoading ? (
              <button onClick={onStop} className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!value.trim()}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  value.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25" : "bg-muted text-muted-foreground"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  )
}
