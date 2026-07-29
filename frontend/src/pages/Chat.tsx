import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { API, type Conversation, type Message } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Send, Trash2, Edit2, Archive, Pin, Star, Search, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    API.chat.listConversations().then((r: any) => setConversations(r.data.conversations))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const createChat = async () => {
    try {
      const r = await API.chat.createConversation()
      const newConv: Conversation = {
        id: r.data.id,
        title: r.data.title,
        provider_id: null, model_id: null,
        is_archived: false, is_pinned: false, is_favorite: false,
        folder: null, tags: [],
        created_at: r.data.created_at,
        updated_at: r.data.created_at,
      }
      setConversations([newConv, ...conversations])
      setActiveConv(newConv)
      setMessages([])
    } catch (err) {
      console.error(err)
    }
  }

  const openChat = async (conv: Conversation) => {
    setActiveConv(conv)
    try {
      const r = await API.chat.getConversation(conv.id)
      setMessages(r.data.messages)
    } catch (err) {
      console.error(err)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return
    const content = input
    setInput('')
    setIsLoading(true)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user', content, attachments: [], is_error: false,
      is_edited: false, model_used: null, tokens_prompt: 0,
      tokens_completion: 0, cost: 0, latency_ms: 0, created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const r = await API.chat.sendMessage(activeConv.id, { content, stream: false })
      const assistantMsg: Message = r.data.assistant_message
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      const errMsg: Message = {
        id: Date.now().toString() + 'err',
        role: 'assistant', content: 'Sorry, an error occurred.', attachments: [],
        is_error: true, is_edited: false, model_used: null, tokens_prompt: 0,
        tokens_completion: 0, cost: 0, latency_ms: 0, created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const deleteChat = async (id: string) => {
    await API.chat.deleteConversation(id)
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeConv?.id === id) {
      setActiveConv(null)
      setMessages([])
    }
  }

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-border flex flex-col bg-card/30">
        <div className="p-4 border-b border-border">
          <Button className="w-full" onClick={createChat}>
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
        <div className="p-2">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search chats..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 mx-1 rounded-lg cursor-pointer transition-colors",
                activeConv?.id === c.id ? "bg-primary/10 text-primary" : "hover:bg-accent"
              )}
              onClick={() => openChat(c)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-sm truncate">{c.title}</span>
              <div className="hidden group-hover:flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); deleteChat(c.id) }} className="p-1 hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
                    <p className="text-muted-foreground">Send a message to begin chatting with AI.</p>
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    msg.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                    msg.is_error && "bg-destructive/10 text-destructive"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading}
                />
                <Button size="icon" onClick={sendMessage} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Universal AI Studio Chat</h2>
              <p className="text-muted-foreground mb-4">Select a conversation or start a new one</p>
              <Button onClick={createChat}><Plus className="mr-2 h-4 w-4" /> New Chat</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
