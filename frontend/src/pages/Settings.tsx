import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { API } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Shield, Palette, Bell, Sun, Moon, Monitor, Key } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user, refresh } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api-tokens', label: 'API Tokens', icon: Key },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="flex gap-8">
        <nav className="w-48 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          {activeTab === 'profile' && <ProfileTab user={user} refresh={refresh} />}
          {activeTab === 'appearance' && <AppearanceTab theme={theme} setTheme={setTheme} />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'api-tokens' && <APITokensTab />}
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user, refresh }: { user: any; refresh: () => void }) {
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [bio, setBio] = useState(user?.bio || '')

  const save = async () => {
    await API.auth.updateMe({ display_name: displayName, bio })
    await refresh()
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your public profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg bg-primary/20 text-primary">
              {user?.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.display_name || user?.email}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Bio</Label>
          <Input value={bio} onChange={e => setBio(e.target.value)} />
        </div>
        <Button onClick={save}>Save changes</Button>
      </CardContent>
    </Card>
  )
}

function AppearanceTab({ theme, setTheme }: { theme: string; setTheme: (t: any) => void }) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how AI Studio looks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                theme === opt.value ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
              )}
            >
              <opt.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function NotificationsTab() {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {['Email notifications', 'Push notifications', 'Chat mentions', 'System updates'].map(item => (
          <div key={item} className="flex items-center justify-between">
            <Label>{item}</Label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function SecurityTab() {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Manage your security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline">Change Password</Button>
        <Button variant="outline">Manage Sessions</Button>
        <Button variant="outline">Two-Factor Authentication</Button>
      </CardContent>
    </Card>
  )
}

function APITokensTab() {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle>API Tokens</CardTitle>
        <CardDescription>Manage your personal API tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Generate New Token</Button>
      </CardContent>
    </Card>
  )
}
