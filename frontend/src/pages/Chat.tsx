import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { API, type Conversation, type Message } from '@/lib/api'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { WelcomeScreen } from '@/components/chat/WelcomeScreen'
import { MessageList } from '@/components/chat/MessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { RightPanel } from '@/components/chat/RightPanel'
import { Button } from '@/components/ui/button'
import { PanelRight, Plug, X, RefreshCw, Link } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SelectableModel {
  id: string
  name: string
  provider_id: string
  provider_name: string
  is_global: boolean
  is_custom: boolean
  context_window: number
  supports_streaming: boolean
  supports_vision: boolean
}

export default function ChatPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  const [allModels, setAllModels] = useState<SelectableModel[]>([])
  const [selectedModel, setSelectedModel] = useState<SelectableModel | null>(null)
  const [userConnections, setUserConnections] = useState<any[]>([])
  const [showConnectionForm, setShowConnectionForm] = useState(false)
  const [connectionForm, setConnectionForm] = useState({ provider_name: '', base_url: '', api_key: '' })

  useEffect(() => {
    API.chat.listConversations().then((r: any) => setConversations(r.data.conversations))
    loadModels()
    loadUserConnections()
  }, [])

  const loadModels = async () => {
    try { const r = await API.providers.allModels(); setAllModels(r.data.models) } catch {}
  }

  const loadUserConnections = async () => {
    try { const r = await API.providers.listUserProviders(); setUserConnections(r.data) } catch {}
  }

  const addConnection = async () => {
    if (!connectionForm.provider_name || !connectionForm.base_url || !connectionForm.api_key) return
    await API.providers.addUserProvider(connectionForm)
    setConnectionForm({ provider_name: '', base_url: '', api_key: '' })
    setShowConnectionForm(false)
    await loadUserConnections()
    await loadModels()
  }

  const discoverUserModels = async (connId: string) => {
    try { await API.providers.discoverUserModels(connId); await loadModels() }
    catch (err: any) { alert(err.response?.data?.detail || 'Failed') }
  }

  const deleteConnection = async (id: string) => {
    await API.providers.deleteUserProvider(id)
    await loadUserConnections()
  }

  const createChat = async () => {
    try {
      const r = await API.chat.createConversation()
      const newConv: Conversation = {
        id: r.data.id, title: r.data.title,
        provider_id: selectedModel?.provider_id || null,
        model_id: selectedModel?.id || null,
        mode_id: null, workspace_id: null,
        is_archived: false, is_pinned: false, is_favorite: false,
        folder: null, tags: [],
        created_at: r.data.created_at, updated_at: r.data.created_at,
      }
      setConversations([newConv, ...conversations])
      setActiveConv(newConv)
      setMessages([])
    } catch (err) { console.error(err) }
  }

  const openChat = async (conv: Conversation) => {
    setActiveConv(conv)
    try {
      const r = await API.chat.getConversation(conv.id)
      setMessages(r.data.messages)
      if (conv.model_id) {
        const found = allModels.find(m => m.id === conv.model_id)
        if (found) setSelectedModel(found)
      }
    } catch (err) { console.error(err) }
  }

  const updateConversation = async (id: string, data: any) => {
    try {
      await API.chat.updateConversation(id, data)
      setConversations(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
      if (activeConv?.id === id) setActiveConv(prev => prev ? { ...prev, ...data } : null)
    } catch {}
  }

  const deleteChat = async (id: string) => {
    await API.chat.deleteConversation(id)
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeConv?.id === id) { setActiveConv(null); setMessages([]) }
  }

  const sendMessage = async (content: string) => {
    if (!activeConv) return
    setInput('')
    setIsLoading(true)

    const userMsg: Message = {
      id: Date.now().toString(), role: 'user', content,
      attachments: [], is_error: false, is_edited: false,
      model_used: selectedModel?.name || null, tokens_prompt: 0,
      tokens_completion: 0, cost: 0, latency_ms: 0, created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const r = await API.chat.sendMessage(activeConv.id, {
        content,
        stream: false,
        model_id: selectedModel?.id || null,
        provider_id: selectedModel?.provider_id || null,
      })
      setMessages(prev => [...prev, r.data.assistant_message])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'err', role: 'assistant',
        content: 'Sorry, an error occurred.', attachments: [],
        is_error: true, is_edited: false, model_used: null,
        tokens_prompt: 0, tokens_completion: 0, cost: 0, latency_ms: 0,
        created_at: new Date().toISOString(),
      }])
    } finally { setIsLoading(false) }
  }

  const handleSuggestion = (prompt: string) => {
    if (!activeConv) {
      API.chat.createConversation().then((r: any) => {
        const newConv: Conversation = {
          id: r.data.id, title: r.data.title,
          provider_id: selectedModel?.provider_id || null,
          model_id: selectedModel?.id || null,
          mode_id: null, workspace_id: null,
          is_archived: false, is_pinned: false, is_favorite: false,
          folder: null, tags: [],
          created_at: r.data.created_at, updated_at: r.data.created_at,
        }
        setConversations(prev => [newConv, ...prev])
        setActiveConv(newConv)
        setMessages([])
      })
    }
    setInput(prompt)
  }

  return (
    <div className="flex h-full">
      {/* Panel 2: Conversation History */}
      <div className="w-[340px] flex-shrink-0 h-full">
        <ConversationSidebar
          conversations={conversations}
          activeConv={activeConv}
          onSelect={openChat}
          onCreate={createChat}
          onDelete={deleteChat}
          onUpdate={updateConversation}
        />

        {/* User connections at bottom */}
        <div className="border-t border-border/50 p-3 bg-card/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Connections</p>
            <button onClick={() => setShowConnectionForm(true)} className="text-muted-foreground hover:text-primary transition-colors">
              <Plug className="h-3.5 w-3.5" />
            </button>
          </div>
          {userConnections.map(conn => (
            <div key={conn.id} className="group flex items-center gap-2 px-2 py-1 rounded text-xs hover:bg-accent/30">
              <Link className="h-3 w-3 text-green-400" />
              <span className="truncate flex-1">{conn.provider_name}</span>
              <button onClick={() => discoverUserModels(conn.id)} className="hidden group-hover:block p-0.5 hover:text-primary">
                <RefreshCw className="h-3 w-3" />
              </button>
              <button onClick={() => deleteConnection(conn.id)} className="hidden group-hover:block p-0.5 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Panel 3: Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            <ChatHeader
              title={activeConv.title}
              models={allModels}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              onRename={() => {
                const name = prompt('Rename conversation', activeConv.title)
                if (name) updateConversation(activeConv.id, { title: name })
              }}
            />
            <MessageList messages={messages} isLoading={isLoading} />
          </>
        ) : (
          <WelcomeScreen onSuggestion={handleSuggestion} />
        )}

        <ChatInput
          onSend={sendMessage}
          onStop={() => setIsLoading(false)}
          isLoading={isLoading}
          suggestedModel={selectedModel?.name}
        />

        {/* Right panel toggle */}
        <button onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-card border border-border/50 rounded-l-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors z-20 shadow-md">
          <PanelRight className="h-4 w-4" />
        </button>
      </div>

      {/* Panel 4: Right Panel */}
      <RightPanel open={rightPanelOpen} onClose={() => setRightPanelOpen(false)}
        selectedModel={selectedModel ? {
          name: selectedModel.name,
          provider_name: selectedModel.provider_name,
          context_window: selectedModel.context_window,
          supports_streaming: selectedModel.supports_streaming,
          supports_vision: selectedModel.supports_vision,
          is_custom: selectedModel.is_custom,
        } : null}
        messages={messages}
      />

      {/* Connection form modal */}
      {showConnectionForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-background/60 backdrop-blur-sm" onClick={() => setShowConnectionForm(false)}>
          <Card className="w-full max-w-md border-border/60 shadow-2xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Add Custom Connection</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowConnectionForm(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provider Name</Label>
                <Input value={connectionForm.provider_name} onChange={e => setConnectionForm({ ...connectionForm, provider_name: e.target.value })} placeholder="My OpenAI Server" />
              </div>
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input value={connectionForm.base_url} onChange={e => setConnectionForm({ ...connectionForm, base_url: e.target.value })} placeholder="https://api.openai.com/v1" />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" value={connectionForm.api_key} onChange={e => setConnectionForm({ ...connectionForm, api_key: e.target.value })} placeholder="sk-..." />
              </div>
              <Button className="w-full" onClick={addConnection}><Plug className="mr-2 h-4 w-4" /> Connect</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
