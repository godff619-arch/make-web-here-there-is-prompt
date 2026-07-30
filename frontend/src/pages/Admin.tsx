import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { API } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, CreditCard, Palette, SlidersHorizontal, Shield, Key, Zap, Bot,
  Trash2, Plus, RefreshCw, CheckCircle2, XCircle, Activity, Clock, Play, Loader2,
  Wifi, WifiOff, Server, Globe, Settings2, Search, Eye, EyeOff, Copy, TestTube, BarChart3, X
} from 'lucide-react'

/* ================================================
   ADMIN DASHBOARD (Health Monitor)
   ================================================ */

function AdminDashboard() {
  const [stats, setStats] = useState<any>({})
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [s, p] = await Promise.all([
        API.admin.getDashboard(),
        API.providers.list(),
      ])
      setStats(s.data)
      setProviders(p.data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <SkeletonCards count={4} />

  const enabledCount = (providers || []).filter((p: any) => p.is_enabled).length
  const totalCount = (providers || []).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Health Dashboard</h2>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.total_users ?? 0} color="text-blue-400" />
        <StatCard icon={Activity} label="Active Today" value={stats.active_users ?? 0} color="text-green-400" />
        <StatCard icon={MessageSquareIcon} label="Conversations" value={stats.total_conversations ?? 0} color="text-purple-400" />
        <StatCard icon={Zap} label="Providers Online" value={`${enabledCount}/${totalCount}`} color="text-orange-400" />
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader><CardTitle className="text-lg">Provider Status</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(providers || []).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className={cn("h-2.5 w-2.5 rounded-full", p.is_enabled ? "bg-green-500" : "bg-red-400")} />
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.api_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {p.is_maintenance && <span className="text-yellow-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Maintenance</span>}
                  <span>{p.is_enabled ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MessageSquareIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}

/* ================================================
   PROVIDER MANAGER
   ================================================ */

function AdminProviders() {
  const [providers, setProviders] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [models, setModels] = useState<any[]>([])
  const [baseUrls, setBaseUrls] = useState<any[]>([])
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const [showAddProvider, setShowAddProvider] = useState(false)
  const [showNewApiKey, setShowNewApiKey] = useState(false)
  const [showTestApiKey, setShowTestApiKey] = useState(false)
  const [newProvider, setNewProvider] = useState({ name: '', slug: '', description: '', api_type: 'openai_compatible' })
  const [newBaseUrlText, setNewBaseUrlText] = useState('')
  const [newApiKeyText, setNewApiKeyText] = useState('')
  const [newModelText, setNewModelText] = useState({ name: '', context_window: 4096, max_tokens: 4096 })
  const [renameModelId, setRenameModelId] = useState<string | null>(null)
  const [renameModelValue, setRenameModelValue] = useState('')

  const loadProviders = async () => {
    const r = await API.providers.list()
    setProviders(r.data || [])
  }

  useEffect(() => { loadProviders() }, [])

  const selectProvider = async (p: any) => {
    setSelected(p)
    setLoading(true)
    setTestResult(null)
    try {
      const [m, b, k] = await Promise.all([
        API.providers.listModels(p.id),
        API.providers.listBaseUrls(p.id),
        API.providers.listApiKeys(p.id),
      ])
      setModels(m.data || [])
      setBaseUrls(b.data || [])
      setApiKeys(k.data || [])
    } catch { setModels([]); setBaseUrls([]); setApiKeys([]) }
    setLoading(false)
  }

  const addProvider = async () => {
    if (!newProvider.name || !newProvider.slug) return
    const r = await API.providers.create(newProvider)
    const pid = r.data.id

    if (newBaseUrlText.trim()) {
      await API.providers.addBaseUrl(pid, { url: newBaseUrlText.trim() })
    }
    if (newApiKeyText.trim()) {
      await API.providers.addApiKey(pid, { key_name: 'default', encrypted_key: newApiKeyText.trim() })
    }

    setNewProvider({ name: '', slug: '', description: '', api_type: 'openai_compatible' })
    setNewBaseUrlText('')
    setNewApiKeyText('')
    setShowAddProvider(false)
    await loadProviders()
    const p = providers.find(x => x.id === pid) || { id: pid, ...newProvider }
    selectProvider(p)
  }

  const testConnection = async (isFromForm = false) => {
    setTesting(true)
    setTestResult(null)
    try {
      const payload = {
        base_url: newBaseUrlText || baseUrls[0]?.url || '',
        encrypted_key: newApiKeyText || apiKeys[0]?.encrypted_key || '',
      }
      const r = await API.providers.testConnection(selected?.id || '', payload)
      setTestResult(r.data)
    } catch (err: any) {
      setTestResult({ success: false, error: err.response?.data?.detail || err.message, latency_ms: 0 })
    }
    setTesting(false)
  }

  const addBaseUrl = async () => {
    if (!selected || !newBaseUrlText.trim()) return
    await API.providers.addBaseUrl(selected.id, { url: newBaseUrlText.trim() })
    setNewBaseUrlText('')
    selectProvider(selected)
  }

  const addApiKey = async () => {
    if (!selected || !newApiKeyText.trim()) return
    await API.providers.addApiKey(selected.id, { key_name: 'default', encrypted_key: newApiKeyText.trim() })
    setNewApiKeyText('')
    selectProvider(selected)
  }

  const addModel = async () => {
    if (!selected || !newModelText.name.trim()) return
    await API.providers.addModel(selected.id, newModelText)
    setNewModelText({ name: '', context_window: 4096, max_tokens: 4096 })
    selectProvider(selected)
  }

  const toggleProvider = async (p: any) => {
    await API.providers.updateProvider(p.id, { is_enabled: !p.is_enabled })
    loadProviders()
  }

  const deleteProvider = async (id: string) => {
    if (!confirm('Delete this provider and all its models?')) return
    await API.providers.deleteProvider(id)
    setSelected(null)
    loadProviders()
  }

  const toggleModel = async (m: any) => {
    await API.providers.updateModel(selected.id, m.id, { is_enabled: !m.is_enabled })
    selectProvider(selected)
  }

  const renameModel = async () => {
    if (!selected || !renameModelId || !renameModelValue.trim()) return
    await API.providers.updateModel(selected.id, renameModelId, { name: renameModelValue.trim() })
    setRenameModelId(null)
    selectProvider(selected)
  }

  const deleteModel = async (modelId: string) => {
    await API.providers.deleteModel(selected.id, modelId)
    selectProvider(selected)
  }

  const discoverModels = async () => {
    if (!selected) return
    try {
      const r = await API.providers.discoverModels(selected.id)
      setTestResult({ success: true, discovered: r.data.discovered, count: r.data.count })
      selectProvider(selected)
    } catch (err: any) { setTestResult({ success: false, error: err.response?.data?.detail || 'Discovery failed' }) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Provider Manager</h2>
        <Button onClick={() => setShowAddProvider(true)}><Plus className="mr-2 h-4 w-4" /> Add Provider</Button>
      </div>

      {showAddProvider && (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Provider Name *</Label><Input value={newProvider.name} onChange={e => setNewProvider({ ...newProvider, name: e.target.value })} placeholder="OpenAI" /></div>
              <div><Label>Slug *</Label><Input value={newProvider.slug} onChange={e => setNewProvider({ ...newProvider, slug: e.target.value })} placeholder="openai" /></div>
              <div><Label>API Type</Label>
                <select value={newProvider.api_type} onChange={e => setNewProvider({ ...newProvider, api_type: e.target.value })} className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm h-10">
                  <option value="openai_compatible">OpenAI Compatible</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google AI</option>
                  <option value="azure">Azure OpenAI</option>
                  <option value="custom">Custom API</option>
                </select>
              </div>
            </div>
            <div><Label>Description</Label><Input value={newProvider.description} onChange={e => setNewProvider({ ...newProvider, description: e.target.value })} placeholder="Leading AI research company" /></div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Base URL</Label>
                <Input value={newBaseUrlText} onChange={e => setNewBaseUrlText(e.target.value)} placeholder="https://api.openai.com/v1" />
              </div>
              <div>
                <Label>API Key</Label>
                <div className="relative">
                  <Input type={showNewApiKey ? 'text' : 'password'} value={newApiKeyText} onChange={e => setNewApiKeyText(e.target.value)} placeholder="sk-..." className="pr-10" />
                  <button type="button" onClick={() => setShowNewApiKey(!showNewApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNewApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => testConnection(true)} disabled={testing || !newBaseUrlText.trim() || !newApiKeyText.trim()}>
                {testing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
                Test Connection
              </Button>
            </div>

            {testResult && (
              <div className={cn("rounded-xl p-4 text-sm", testResult.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20")}>
                <div className="flex items-center gap-3 mb-2">
                  {testResult.success
                    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                    : <XCircle className="h-5 w-5 text-red-500" />}
                  <span className="font-semibold">{testResult.success ? 'Connection Successful' : 'Connection Failed'}</span>
                  {testResult.latency_ms !== undefined && (
                    <span className="ml-auto text-xs bg-background px-2 py-0.5 rounded-full font-mono">
                      {testResult.latency_ms}ms
                    </span>
                  )}
                </div>
                {testResult.success && testResult.model_count !== undefined && (
                  <p className="text-xs text-muted-foreground">Found {testResult.model_count} models: {testResult.models_found?.slice(0, 8).join(', ')}{testResult.model_count > 8 ? '...' : ''}</p>
                )}
                {!testResult.success && <p className="text-xs text-muted-foreground">{testResult.error}</p>}
                {testResult.discovered && <p className="text-xs text-muted-foreground">Discovered {testResult.count} models: {testResult.discovered?.slice(0, 8).join(', ')}</p>}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={addProvider}>Create Provider</Button>
              <Button variant="outline" onClick={() => { setShowAddProvider(false); setTestResult(null) }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-1">
          {providers.map(p => (
            <div key={p.id} className={cn(
              "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all",
              selected?.id === p.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 hover:border-primary/30 bg-card/50"
            )} onClick={() => selectProvider(p)}>
              <div>
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.slug} - {p.api_type}</p>
              </div>
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => toggleProvider(p)} className={cn("w-8 h-4.5 rounded-full transition-colors", p.is_enabled ? "bg-primary" : "bg-muted-foreground/30")}>
                  <div className={cn("h-3.5 w-3.5 rounded-full bg-white mt-0.5 transition-transform", p.is_enabled ? "translate-x-[16px]" : "translate-x-[1px]")} />
                </button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteProvider(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>{selected.name}</CardTitle>
                <CardDescription>{selected.description || `Provider: ${selected.slug}`}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base URLs */}
                <div>
                  <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-semibold">Base URLs</h4></div>
                  <div className="flex gap-2 mb-3">
                    <Input value={newBaseUrlText} onChange={e => setNewBaseUrlText(e.target.value)} placeholder="https://api.openai.com/v1" className="h-9" />
                    <Button size="sm" onClick={addBaseUrl}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
                  </div>
                  <div className="space-y-1.5">
                    {baseUrls.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background/50 text-sm">
                        <span className="truncate text-xs font-mono">{u.url}</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded", u.is_enabled ? "text-green-500" : "text-red-400")}>{u.is_enabled ? 'Active' : 'Disabled'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Keys */}
                <div>
                  <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-semibold">API Keys</h4></div>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Input type={showTestApiKey ? 'text' : 'password'} value={newApiKeyText} onChange={e => setNewApiKeyText(e.target.value)} placeholder="sk-..." className="pr-10 h-9" />
                      <button type="button" onClick={() => setShowTestApiKey(!showTestApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showTestApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button size="sm" onClick={addApiKey}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
                    <Button variant="outline" size="sm" onClick={() => testConnection()} disabled={testing}>
                      {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      <span className="ml-1 hidden sm:inline">Test</span>
                    </Button>
                  </div>
                  {apiKeys.map(k => (
                    <div key={k.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background/50 text-sm">
                      <span className="text-xs font-medium">{k.key_name}</span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded", k.is_active ? "text-green-500" : "text-red-400")}>{k.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  ))}
                </div>

                {testResult && (
                  <div className={cn("rounded-xl p-4 text-sm", testResult.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20")}>
                    <div className="flex items-center gap-3 mb-1">
                      {testResult.success ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                      <span className="font-semibold">{testResult.success ? 'Connection OK' : 'Connection Failed'}</span>
                      {testResult.latency_ms !== undefined && <span className="ml-auto text-sm bg-background px-2 py-0.5 rounded-full font-mono font-bold">{testResult.latency_ms}ms</span>}
                    </div>
                    {testResult.success && testResult.model_count !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">Found {testResult.model_count} models: {testResult.models_found?.slice(0, 8).join(', ')}{testResult.model_count > 8 ? '...' : ''}</p>
                    )}
                    {testResult.discovered && <p className="text-xs text-muted-foreground mt-1">Discovered {testResult.count} models: {testResult.discovered?.slice(0, 8).join(', ')}</p>}
                    {!testResult.success && <p className="text-xs text-muted-foreground mt-1">{testResult.error}</p>}
                  </div>
                )}

                <Separator />

                {/* Models */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Models ({models.length})</h4>
                    <Button variant="outline" size="sm" onClick={discoverModels}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Auto Discover</Button>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Input value={newModelText.name} onChange={e => setNewModelText({ ...newModelText, name: e.target.value })} placeholder="gpt-4" className="h-9" />
                    <Input type="number" value={newModelText.context_window} onChange={e => setNewModelText({ ...newModelText, context_window: +e.target.value })} placeholder="Context" className="w-24 h-9" />
                    <Button size="sm" onClick={addModel}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
                  </div>
                  <div className="space-y-1.5 max-h-96 overflow-y-auto">
                    {models.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background/50 text-sm">
                        {renameModelId === m.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input autoFocus value={renameModelValue} onChange={e => setRenameModelValue(e.target.value)} onBlur={renameModel} onKeyDown={e => { if (e.key === 'Enter') renameModel(); if (e.key === 'Escape') setRenameModelId(null) }} className="h-7 text-xs" />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className={cn("truncate font-medium", m.is_enabled === false && "line-through text-muted-foreground")}>{m.name}</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">{m.context_window >= 1000 ? `${(m.context_window/1000).toFixed(0)}K ctx` : ''}</span>
                              {m.supports_vision && <span className="text-xs px-1 rounded bg-primary/10 text-primary flex-shrink-0">Vision</span>}
                            </div>
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              <button onClick={() => toggleModel(m)} className={cn("w-7 h-4 rounded-full transition-colors", m.is_enabled !== false ? "bg-primary" : "bg-muted-foreground/30")}>
                                <div className={cn("h-3 w-3 rounded-full bg-white mt-0.5 transition-transform", m.is_enabled !== false ? "translate-x-[14px]" : "translate-x-[1px]")} />
                              </button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setRenameModelId(m.id); setRenameModelValue(m.name) }}><Settings2 className="h-3 w-3" /></Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteModel(m.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {models.length === 0 && !loading && <p className="text-xs text-muted-foreground text-center py-4">No models configured</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 bg-card/50 h-full">
              <CardContent className="flex items-center justify-center p-12 text-muted-foreground">
                <div className="text-center"><Zap className="h-8 w-8 mx-auto mb-2" /><p>Select a provider to manage</p></div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================================================
   USER MANAGEMENT
   ================================================ */

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try { const r = await API.admin.listUsers({ limit: 100 }); setUsers(r.data.users) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const updateUser = async (id: string, data: any) => {
    await API.admin.updateUser(id, data)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return
    await API.admin.deleteUser(id)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  if (loading) return <SkeletonCards count={3} />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh</Button>
      </div>
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Joined</th><th className="p-4">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="p-4"><p className="font-medium">{u.display_name || u.email}</p><p className="text-xs text-muted-foreground">{u.email}</p></td>
                    <td className="p-4">
                      <select value={u.role} onChange={e => updateUser(u.id, { role: e.target.value })} className="text-xs rounded-lg border border-border/50 bg-background px-2 py-1">
                        <option value="member">Member</option><option value="admin">Admin</option><option value="owner">Owner</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium", u.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400")}>{u.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => updateUser(u.id, { is_active: !u.is_active })}>{u.is_active ? 'Suspend' : 'Activate'}</Button>
                        {u.role !== 'owner' && <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}><Trash2 className="h-3 w-3" /></Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ================================================
   MEMBERSHIPS, BRANDING, FEATURES, API KEYS, MODES
   ================================================ */

function AdminMemberships() {
  const [plans, setPlans] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price_monthly: 0, features: '{}' })

  const load = async () => { const r = await API.admin.listMemberships(); setPlans(r.data) }
  useEffect(() => { load() }, [])

  const create = async () => {
    await API.admin.createMembership({ ...form, price_monthly: +form.price_monthly, features: JSON.parse(form.features) })
    setShowAdd(false); setForm({ name: '', description: '', price_monthly: 0, features: '{}' }); load()
  }

  const toggle = async (id: string, data: any) => { await API.admin.updateMembership(id, data); load() }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Membership Plans</h2>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Add Plan</Button>
      </div>
      {showAdd && (
        <Card className="border-border/50 bg-card/50 mb-4"><CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Price Monthly</Label><Input type="number" value={form.price_monthly} onChange={e => setForm({ ...form, price_monthly: +e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Features (JSON)</Label><Input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder='{"max_models":10}' /></div>
          <div className="flex gap-2"><Button onClick={create}>Create</Button><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(p => (
          <Card key={p.id} className="border-border/50 bg-card/50">
            <CardHeader><CardTitle>{p.name}</CardTitle><CardDescription>{p.description}</CardDescription></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">${p.price_monthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              {p.features && <ul className="space-y-1 text-sm text-muted-foreground">{Object.entries(p.features).map(([k, v]: any) => (
                <li key={k} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {k}: {v}</li>
              ))}</ul>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AdminBranding() {
  const [b, setB] = useState({ site_name: '', short_name: '', primary_color: '#6366f1', footer_text: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    API.settings.getBranding().then((r: any) => setB({
      site_name: r.data.site_name || '', short_name: r.data.short_name || '',
      primary_color: r.data.primary_color || '#6366f1', footer_text: r.data.footer_text || ''
    }))
  }, [])

  const save = async () => { await API.settings.updateBranding(b); setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Branding Manager</h2>
      <Card className="border-border/50 bg-card/50 max-w-2xl">
        <CardContent className="p-6 space-y-4">
          <div><Label>Site Name</Label><Input value={b.site_name} onChange={e => setB({ ...b, site_name: e.target.value })} /></div>
          <div><Label>Short Name</Label><Input value={b.short_name} onChange={e => setB({ ...b, short_name: e.target.value })} /></div>
          <div><Label>Footer Text</Label><Input value={b.footer_text} onChange={e => setB({ ...b, footer_text: e.target.value })} /></div>
          <div><Label>Primary Color</Label>
            <div className="flex gap-2"><Input type="color" value={b.primary_color} onChange={e => setB({ ...b, primary_color: e.target.value })} className="w-16 h-10 p-1" /><Input value={b.primary_color} onChange={e => setB({ ...b, primary_color: e.target.value })} /></div>
          </div>
          <Button onClick={save}>{saved ? 'Saved!' : 'Save Branding'}</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminFeatures() {
  const defaultFeatures = [
    { id: 'chat', name: 'Chat Studio', slug: 'chat', is_enabled: true, status: 'enabled' },
    { id: 'coding', name: 'Coding Studio', slug: 'coding', is_enabled: true, status: 'enabled' },
    { id: 'image', name: 'Image Studio', slug: 'image', is_enabled: true, status: 'enabled' },
    { id: 'video', name: 'Video Studio', slug: 'video', is_enabled: true, status: 'enabled' },
    { id: 'voice', name: 'Voice Studio', slug: 'voice', is_enabled: true, status: 'beta' },
    { id: 'document', name: 'Document Studio', slug: 'document', is_enabled: true, status: 'enabled' },
    { id: 'knowledge', name: 'Knowledge Base', slug: 'knowledge', is_enabled: true, status: 'beta' },
    { id: 'agents', name: 'AI Agents', slug: 'agents', is_enabled: false, status: 'experimental' },
  ]
  const [features, setFeatures] = useState(defaultFeatures)

  useEffect(() => {
    API.settings.listFeatures().then((r: any) => { if (r.data?.length > 0) setFeatures(r.data) }).catch(() => {})
  }, [])

  const toggle = async (id: string, enabled: boolean) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, is_enabled: !enabled } : f))
    try { await API.settings.toggleFeature(id, { is_enabled: !enabled }) } catch { setFeatures(prev => prev.map(f => f.id === id ? { ...f, is_enabled: enabled } : f)) }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Feature Control Center</h2>
      <Card className="border-border/50 bg-card/50 max-w-2xl">
        <CardContent className="p-0 divide-y divide-border/50">
          {features.map(f => (
            <div key={f.id} className="flex items-center justify-between p-4">
              <div><p className="font-medium">{f.name}</p><p className="text-xs text-muted-foreground">{f.slug}</p></div>
              <div className="flex items-center gap-3">
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", f.status === 'enabled' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : f.status === 'beta' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400")}>{f.status}</span>
                <button onClick={() => toggle(f.id, f.is_enabled)} className={cn("w-9 h-5 rounded-full transition-colors", f.is_enabled ? "bg-primary" : "bg-muted-foreground/30")}>
                  <div className={cn("h-4 w-4 rounded-full bg-white transition-transform mt-0.5", f.is_enabled ? "translate-x-[18px]" : "translate-x-[2px]")} />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function AdminModes() {
  const [modes, setModes] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', temperature: 0.7, streaming: true })

  const load = async () => { const r = await API.providers.listModes(); setModes(r.data) }
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.name || !form.slug) return
    await API.providers.createMode(form)
    setShowAdd(false); setForm({ name: '', slug: '', description: '', temperature: 0.7, streaming: true }); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">AI Modes</h2>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" /> Add Mode</Button>
      </div>
      {showAdd && (
        <Card className="border-border/50 bg-card/50 mb-4"><CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Precise" /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="precise" /></div>
          </div>
          <div><Label>Temperature</Label><Input type="number" step="0.1" value={form.temperature} onChange={e => setForm({ ...form, temperature: +e.target.value })} /></div>
          <div className="flex gap-2"><Button onClick={create}>Create</Button><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <Card className="border-border/50 bg-card/50 max-w-2xl">
        <CardContent className="p-0 divide-y divide-border/50">
          {modes.map(m => (
            <div key={m.id} className="flex items-center justify-between p-4">
              <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.slug} - temp: {m.temperature}</p></div>
              <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{m.streaming ? 'Streaming' : 'Non-streaming'}</span></div>
            </div>
          ))}
          {modes.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No modes configured</p>}
        </CardContent>
      </Card>
    </div>
  )
}

/* ================================================
   API TEST CENTER
   ================================================ */

function AdminTestCenter() {
  const [providers, setProviders] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')
  const [baseUrls, setBaseUrls] = useState<any[]>([])
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)
  const [testType, setTestType] = useState('list-models')

  useEffect(() => { API.providers.list().then((r: any) => setProviders(r.data || [])) }, [])

  const selectProvider = async (id: string) => {
    setSelected(id); setTestResult(null)
    try { const r = await API.providers.listBaseUrls(id); setBaseUrls(r.data || []) } catch { setBaseUrls([]) }
  }

  const runTest = async () => {
    setTesting(true)
    setTestResult({ type: testType, status: 'running', start: Date.now() })
    try {
      if (testType === 'discover-models') {
        const r = await API.providers.discoverModels(selected)
        setTestResult({ type: testType, status: 'success', data: r.data, latency: Date.now() - (testResult as any)?.start })
      } else if (testType === 'list-models') {
        const r = await API.providers.listModels(selected)
        setTestResult({ type: testType, status: 'success', data: r.data, count: (r.data || []).length, latency: Date.now() - (testResult as any)?.start })
      } else if (testType === 'health') {
        const start = Date.now()
        const r = await fetch('/api/health')
        setTestResult({ type: testType, status: r.ok ? 'success' : 'error', statusCode: r.status, latency: Date.now() - start })
      }
    } catch (err: any) {
      setTestResult({ type: testType, status: 'error', error: err.message || 'Request failed', latency: Date.now() - (testResult as any)?.start })
    }
    setTesting(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">API Test Center</h2>
      <Card className="border-border/50 bg-card/50 max-w-2xl">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Provider</Label>
            <select value={selected} onChange={e => selectProvider(e.target.value)} className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm mt-1">
              <option value="">Select provider...</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {selected && baseUrls.length > 0 && (
            <div><Label>Base URLs</Label><div className="mt-1 space-y-1">{baseUrls.map(u => <div key={u.id} className="text-xs font-mono bg-muted/50 rounded px-2 py-1">{u.url}</div>)}</div></div>
          )}

          <div>
            <Label>Test Type</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {['list-models', 'discover-models', 'health'].map(t => (
                <Button key={t} variant={testType === t ? 'default' : 'outline'} size="sm" onClick={() => setTestType(t)}>{t}</Button>
              ))}
            </div>
          </div>

          <Button onClick={runTest} disabled={!selected || testing}>
            {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...</> : <><Play className="mr-2 h-4 w-4" /> Run Test</>}
          </Button>

          {testResult && (
            <Card className="border-border/40 bg-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", testResult.status === 'success' ? 'bg-green-500' : testResult.status === 'running' ? 'bg-yellow-500' : 'bg-red-500')} />
                  <span className="font-medium text-sm">{testResult.type}</span>
                  {testResult.latency !== undefined && <span className="text-xs text-muted-foreground">{testResult.latency}ms</span>}
                </div>
                {testResult.status === 'success' && <pre className="text-xs bg-background rounded p-3 overflow-x-auto max-h-60">{JSON.stringify(testResult.data || { count: testResult.count }, null, 2)}</pre>}
                {testResult.status === 'error' && <p className="text-sm text-destructive">{testResult.error}</p>}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ================================================
   UTILS & ROUTER
   ================================================ */

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ${color}`}><Icon className="h-6 w-6" /></div>
        <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
      </CardContent>
    </Card>
  )
}

function SkeletonCards({ count }: { count: number }) {
  return <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="border-border/50 bg-card/50"><CardContent className="p-6 space-y-3 animate-pulse">
        <div className="h-8 w-20 bg-muted rounded" /><div className="h-4 bg-muted rounded" />
      </CardContent></Card>
    ))}
  </div>
}

const adminPages: Record<string, { component: React.FC; icon: any; label: string }> = {
  dashboard: { component: AdminDashboard, icon: BarChart3, label: 'Dashboard' },
  providers: { component: AdminProviders, icon: Bot, label: 'AI Providers' },
  'test-center': { component: AdminTestCenter, icon: TestTube, label: 'API Test Center' },
  modes: { component: AdminModes, icon: Settings2, label: 'AI Modes' },
  users: { component: AdminUsers, icon: Users, label: 'Users' },
  memberships: { component: AdminMemberships, icon: CreditCard, label: 'Memberships' },
  branding: { component: AdminBranding, icon: Palette, label: 'Branding' },
  features: { component: AdminFeatures, icon: SlidersHorizontal, label: 'Features' },
}

export default function AdminPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = location.pathname.replace('/admin', '').replace('/', '') || 'dashboard'
  const pageEntry = adminPages[currentTab]
  const Component = pageEntry?.component || AdminDashboard

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex gap-2 mb-8 overflow-x-auto flex-wrap">
        {Object.entries(adminPages).map(([id, entry]) => (
          <Button key={id} variant={currentTab === id ? 'default' : 'outline'} onClick={() => navigate(`/admin/${id}`)} className="flex items-center gap-2">
            <entry.icon className="h-4 w-4" /> {entry.label}
          </Button>
        ))}
      </div>
      <Component />
    </div>
  )
}

export { AdminDashboard, AdminProviders, AdminUsers, AdminMemberships, AdminBranding, AdminFeatures, AdminModes, AdminTestCenter }
