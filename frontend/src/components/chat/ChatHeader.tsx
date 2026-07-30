import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bot, ChevronDown, Settings2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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

interface ChatHeaderProps {
  title: string
  models: SelectableModel[]
  selectedModel: SelectableModel | null
  onSelectModel: (m: SelectableModel) => void
  onRename: () => void
}

export function ChatHeader({ title, models, selectedModel, onSelectModel, onRename }: ChatHeaderProps) {
  const groupedModels = () => {
    const groups: Record<string, SelectableModel[]> = {}
    for (const m of models) {
      const key = m.is_custom ? `Custom: ${m.provider_name}` : m.provider_name
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    }
    return groups
  }

  return (
    <div className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <button className="text-sm font-semibold truncate hover:text-primary transition-colors" onClick={onRename}>
          {title}
        </button>
        {selectedModel && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            <Bot className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{selectedModel.name}</span>
            {selectedModel.is_custom && <span className="text-green-400">&#9679;</span>}
          </span>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Settings2 className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 max-h-80 overflow-y-auto">
          {Object.entries(groupedModels()).map(([provider, mdls]) => (
            <div key={provider}>
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{provider}</div>
              {mdls.map(m => (
                <DropdownMenuItem key={m.id} onClick={() => onSelectModel(m)}
                  className={cn("flex items-center justify-between text-sm", selectedModel?.id === m.id && "bg-primary/10 text-primary")}>
                  <span className="truncate">{m.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{m.context_window >= 1000 ? `${(m.context_window / 1000).toFixed(0)}K` : m.context_window}</span>
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
