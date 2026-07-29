import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Code, Image, Video, Mic, FileText, BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const quickActions = [
  { label: 'New Chat', icon: MessageSquare, path: '/chat', color: 'text-blue-400' },
  { label: 'Coding Studio', icon: Code, path: '/coding', color: 'text-green-400' },
  { label: 'Image Studio', icon: Image, path: '/image', color: 'text-purple-400' },
  { label: 'Video Studio', icon: Video, path: '/video', color: 'text-pink-400' },
  { label: 'Voice Studio', icon: Mic, path: '/voice', color: 'text-orange-400' },
  { label: 'Document Studio', icon: FileText, path: '/document', color: 'text-yellow-400' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back{user?.display_name ? `, ${user.display_name}` : ''}
        </h1>
        <p className="mt-2 text-muted-foreground">Your AI-powered workspace is ready.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) => (
          <Card
            key={action.path}
            className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer bg-card/50 backdrop-blur-sm"
            onClick={() => navigate(action.path)}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{action.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Start creating with {action.label.toLowerCase()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Chats</CardTitle>
            <CardDescription>Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 p-3 hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => navigate('/chat')}>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Chat Session {i}</p>
                    <p className="text-xs text-muted-foreground">Last active 2 hours ago</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>Your activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Chats', value: '12', icon: MessageSquare },
                { label: 'Files Uploaded', value: '8', icon: FileText },
                { label: 'Images Generated', value: '3', icon: Image },
                { label: 'Prompts Saved', value: '5', icon: BookOpen },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border/50 p-4 text-center">
                  <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
