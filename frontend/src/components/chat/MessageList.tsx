import React from 'react'
import type { Message } from '@/lib/api'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0 && !isLoading) return null

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} message={msg} index={i} />
        ))}
        {isLoading && <LoadingDots />}
      </div>
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5">
          <motion.div className="h-2 w-2 rounded-full bg-primary/60" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
          <motion.div className="h-2 w-2 rounded-full bg-primary/60" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
          <motion.div className="h-2 w-2 rounded-full bg-primary/60" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className={cn("flex gap-3", isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
          <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9"/><path d="M9 16h6"/>
          </svg>
        </div>
      )}
      <div className={cn("max-w-[85%] sm:max-w-[75%]", isUser && "ml-auto")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md",
          message.is_error && "bg-destructive/10 text-destructive border border-destructive/20"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match
                    return !isInline && match ? (
                      <div className="relative group my-3">
                        <div className="flex items-center justify-between px-4 py-1.5 bg-muted-foreground/10 rounded-t-lg text-xs text-muted-foreground">
                          <span>{match[1]}</span>
                          <button onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-foreground">
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                        </div>
                        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div"
                          customStyle={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, fontSize: '0.8rem' }}>
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-muted-foreground/15 rounded px-1.5 py-0.5 text-xs font-mono" {...props}>{children}</code>
                    )
                  },
                  table({ children }) {
                    return <div className="overflow-x-auto my-3"><table className="min-w-full border-collapse border border-border/40 rounded-lg overflow-hidden">{children}</table></div>
                  },
                  th({ children }) {
                    return <th className="border border-border/40 bg-muted/50 px-3 py-2 text-left text-xs font-semibold">{children}</th>
                  },
                  td({ children }) {
                    return <td className="border border-border/40 px-3 py-1.5 text-xs">{children}</td>
                  },
                  a({ children, href }) {
                    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">{children}</a>
                  },
                  ul({ children }) { return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul> },
                  ol({ children }) { return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol> },
                  blockquote({ children }) { return <blockquote className="border-l-2 border-primary/30 pl-4 italic text-muted-foreground my-2">{children}</blockquote> },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && !message.is_error && (
          <div className="flex items-center gap-1 mt-1.5 px-1">
            <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Copy">
              <Copy className="h-3.5 w-3.5" onClick={() => navigator.clipboard.writeText(message.content)} />
            </button>
            <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Regenerate">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Good response">
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Bad response">
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
