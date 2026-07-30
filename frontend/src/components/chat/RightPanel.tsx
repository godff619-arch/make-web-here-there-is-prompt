import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Info, FileText, Image, Bot, Coins, Cpu, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RightPanelProps {
  open: boolean
  onClose: () => void
  selectedModel: {
    name: string
    provider_name: string
    context_window: number
    supports_streaming: boolean
    supports_vision: boolean
    is_custom: boolean
  } | null
  messages: any[]
}

export function RightPanel({ open, onClose, selectedModel, messages }: RightPanelProps) {
  if (!open) return null

  const totalTokens = messages.reduce((sum, m) => sum + (m.tokens_prompt || 0) + (m.tokens_completion || 0), 0)
  const totalCost = messages.reduce((sum, m) => sum + (m.cost || 0), 0)

  return (
    <div className="w-[340px] border-l border-border/50 bg-card/30 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="text-sm font-semibold">Context Panel</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedModel && (
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4" /> Model Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Model</span><span className="font-medium">{selectedModel.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span>{selectedModel.provider_name}{selectedModel.is_custom ? ' (custom)' : ''}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Context</span><span>{selectedModel.context_window >= 1000 ? `${(selectedModel.context_window / 1000).toFixed(0)}K tokens` : selectedModel.context_window}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Streaming</span><span>{selectedModel.supports_streaming ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Vision</span><span>{selectedModel.supports_vision ? 'Yes' : 'No'}</span></div>
            </CardContent>
          </Card>
        )}

        {messages.length > 0 && (
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" /> Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Total Tokens</span><span className="font-medium tabular-nums">{totalTokens.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Messages</span><span className="font-medium">{messages.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cost</span><span className="font-medium">{totalCost > 0 ? `$${totalCost.toFixed(4)}` : 'N/A'}</span></div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" /> Attachments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground text-center py-4">No files attached</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
