import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  MessageSquare, Code, Image, Video, Mic, FileText, BookOpen, Database,
  Settings, Users, Palette, Sun, Moon, LogOut, Menu, X, Sparkles,
  Search, Bell, FolderOpen, History, Star, Pin, Archive, Home,
  Bot, SlidersHorizontal, Shield, CreditCard, Zap, Key, TestTube, BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Chat', path: '/chat', icon: MessageSquare },
  { label: 'Coding Studio', path: '/coding', icon: Code },
  { label: 'Image Studio', path: '/image', icon: Image },
  { label: 'Video Studio', path: '/video', icon: Video },
  { label: 'Voice Studio', path: '/voice', icon: Mic },
  { label: 'Document Studio', path: '/document', icon: FileText },
  { label: 'Prompt Library', path: '/prompts', icon: BookOpen },
  { label: 'Knowledge Base', path: '/knowledge', icon: Database },
  { label: 'Files', path: '/files', icon: FolderOpen },
]

const adminNavItems = [
  { label: 'Admin Dashboard', path: '/admin', icon: Shield },
  { label: 'AI Connections', path: '/admin/providers', icon: Bot },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Memberships', path: '/admin/memberships', icon: CreditCard },
  { label: 'Branding', path: '/admin/branding', icon: Palette },
  { label: 'Feature Control', path: '/admin/features', icon: SlidersHorizontal },
  { label: 'API Keys', path: '/admin/api-keys', icon: Key },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const { theme, setTheme, isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin' || user?.role === 'owner'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className={cn(
        "flex flex-col border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          {sidebarOpen ? (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm">AI Studio</span>
            </Link>
          ) : (
            <Link to="/dashboard" className="mx-auto">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                location.pathname.startsWith(item.path)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}

          {isAdmin && sidebarOpen && (
            <div className="pt-4">
              <p className="px-3 text-xs font-medium text-muted-foreground mb-1">Administration</p>
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    location.pathname.startsWith(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-border p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                !sidebarOpen && "justify-center"
              )}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {user?.display_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.display_name || user?.email}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                <Users className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme(isDark ? 'light' : 'dark')}>
                {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); navigate('/login') }}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export function AuthLayout() {
  return <Outlet />
}
