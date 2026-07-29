import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { API } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Users, UserPlus, Banana, Shield, CreditCard, Trash2, Edit2, Search, Activity, MessageSquare, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.admin.listUsers({ limit: 50 }).then((r: any) => {
      setUsers(r.data.users)
      setLoading(false)
    })
  }, [])

  const updateUser = async (id: string, data: any) => {
    await API.admin.updateUser(id, data)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))
  }

  const deleteUser = async (id: string) => {
    await API.admin.deleteUser(id)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="p-4">
                      <p className="font-medium">{u.display_name || u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        u.role === 'owner' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                        u.role === 'admin' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        u.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {u.role !== 'owner' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateUser(u.id, { is_active: !u.is_active })}>
                              {u.is_active ? 'Suspend' : 'Activate'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
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

function AdminDashboard() {
  const [stats, setStats] = useState<any>({})
  useEffect(() => {
    API.admin.getDashboard().then((r: any) => setStats(r.data))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-400' },
          { label: 'Active Users', value: stats.active_users, icon: Activity, color: 'text-green-400' },
          { label: 'Conversations', value: stats.total_conversations, icon: MessageSquare, color: 'text-purple-400' },
          { label: 'Today Chats', value: stats.today_conversations, icon: Zap, color: 'text-orange-400' },
        ].map(stat => (
          <Card key={stat.label} className="border-border/50 bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value ?? '...'}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AdminMemberships() {
  const [plans, setPlans] = useState<any[]>([])
  useEffect(() => {
    API.admin.listMemberships().then((r: any) => setPlans(r.data))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Membership Plans</h2>
        <Button><CreditCard className="mr-2 h-4 w-4" /> Add Plan</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <Card key={plan.id} className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">
                ${plan.price_monthly} <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              {plan.features && Object.keys(plan.features).length > 0 && (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {Object.entries(plan.features).map(([k, v]: any) => (
                    <li key={k} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" /> {k}: {v}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AdminBranding() {
  const [branding, setBranding] = useState<any>({})
  const [siteName, setSiteName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')

  useEffect(() => {
    API.settings.getBranding().then((r: any) => {
      setBranding(r.data)
      setSiteName(r.data.site_name || '')
      setPrimaryColor(r.data.primary_color || '#6366f1')
    })
  }, [])

  const save = async () => {
    await API.settings.updateBranding({ site_name: siteName, primary_color: primaryColor })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Branding Manager</h2>
      <Card className="border-border/50 bg-card/50 max-w-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input value={siteName} onChange={e => setSiteName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-16 h-10 p-1" />
              <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
            </div>
          </div>
          <Button onClick={save}>Save Branding</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminFeatures() {
  const [features, setFeatures] = useState<any[]>([])
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

  useEffect(() => {
    API.settings.listFeatures().then((r: any) => {
      if (r.data.length > 0) setFeatures(r.data)
      else setFeatures(defaultFeatures)
    }).catch(() => setFeatures(defaultFeatures))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Feature Control Center</h2>
      <Card className="border-border/50 bg-card/50 max-w-2xl">
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {features.map(f => (
              <div key={f.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    f.status === 'enabled' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    f.status === 'beta' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  )}>
                    {f.status}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={f.is_enabled} onChange={() => {}} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const adminPages: Record<string, React.FC> = {
  dashboard: AdminDashboard,
  users: AdminUsers,
  memberships: AdminMemberships,
  branding: AdminBranding,
  features: AdminFeatures,
  providers: () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">AI Providers</h2>
      <p className="text-muted-foreground">Configure AI providers, models, base URLs, and API keys.</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {['OpenAI', 'Anthropic', 'Google Gemini', 'OpenRouter', 'Groq', 'Mistral'].map(p => (
          <Card key={p} className="border-border/50 bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{p}</p>
                <p className="text-xs text-muted-foreground">openai_compatible</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  ),
  'api-keys': () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">API Key Vault</h2>
      <p className="text-muted-foreground">Securely manage API keys for AI providers.</p>
    </div>
  ),
}

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard')
  const Component = adminPages[tab] || AdminDashboard

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'memberships', label: 'Memberships', icon: CreditCard },
    { id: 'providers', label: 'Providers', icon: Zap },
    { id: 'branding', label: 'Branding', icon: Shield },
    { id: 'features', label: 'Features', icon: Banana },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map(t => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'default' : 'outline'}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2"
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </Button>
        ))}
      </div>
      <Component />
    </div>
  )
}

export { AdminUsers, AdminDashboard, AdminMemberships, AdminBranding, AdminFeatures }
