import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AppLayout, AuthLayout } from '@/layouts/AppLayout'
import LoginPage from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import ChatPage from '@/pages/Chat'
import AdminPage from '@/pages/Admin'
import SettingsPage from '@/pages/Settings'
import { PlaceholderStudio } from '@/pages/Studios'
import { Code, Image, Video, Mic, FileText, BookOpen, Database, FolderOpen } from 'lucide-react'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-full bg-primary/60 animate-bounce" />
          <div className="h-3 w-3 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="h-3 w-3 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/coding" element={<PlaceholderStudio title="Coding Studio" icon={Code} />} />
        <Route path="/image" element={<PlaceholderStudio title="Image Studio" icon={Image} />} />
        <Route path="/video" element={<PlaceholderStudio title="Video Studio" icon={Video} />} />
        <Route path="/voice" element={<PlaceholderStudio title="Voice Studio" icon={Mic} />} />
        <Route path="/document" element={<PlaceholderStudio title="Document Studio" icon={FileText} />} />
        <Route path="/prompts" element={<PlaceholderStudio title="Prompt Library" icon={BookOpen} />} />
        <Route path="/knowledge" element={<PlaceholderStudio title="Knowledge Base" icon={Database} />} />
        <Route path="/files" element={<PlaceholderStudio title="File Manager" icon={FolderOpen} />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
