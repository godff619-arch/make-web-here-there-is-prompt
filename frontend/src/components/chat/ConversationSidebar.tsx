import React, { useState } from 'react'
import { API, type Conversation } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { MessageSquare, Search, Trash2, Pin, Archive, FolderOpen, FolderPlus, Star, Plus, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface ConversationSidebarProps {
  conversations: Conversation[]
  activeConv: Conversation | null
  onSelect: (c: Conversation) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onUpdate: (id: string, data: any) => void
}

export function ConversationSidebar({ conversations, activeConv, onSelect, onCreate, onDelete, onUpdate }: ConversationSidebarProps) {
  const [search, setSearch] = useState('')
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const startRename = (c: Conversation) => {
    setRenaming(c.id)
    setRenameValue(c.title)
  }

  const submitRename = async () => {
    if (renaming && renameValue.trim()) {
      await onUpdate(renaming, { title: renameValue.trim() })
    }
    setRenaming(null)
  }

  const filtered = conversations.filter(c => {
    if (!search) return true
    return c.title.toLowerCase().includes(search.toLowerCase())
  })

  const pinned = filtered.filter(c => c.is_pinned)
  const normal = filtered.filter(c => !c.is_pinned)

  return (
    <div className="flex flex-col h-full border-r border-border/50 bg-card/30">
      <div className="p-3 border-b border-border/50 space-y-2">
        <Button className="w-full justify-start gap-2 h-10 rounded-xl font-medium" onClick={onCreate}>
          <Plus className="h-4 w-4" /> New Chat
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8 h-9 text-sm rounded-lg bg-background/50" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {pinned.length > 0 && (
          <div className="px-2 py-1">
            <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pinned</p>
            {pinned.map(c => (
              <ConversationItem key={c.id} conv={c} active={activeConv?.id === c.id}
                onSelect={onSelect} onPin={() => onUpdate(c.id, { is_pinned: !c.is_pinned })}
                onDelete={onDelete} onRename={startRename}
                renaming={renaming} renameValue={renameValue} setRenameValue={setRenameValue} submitRename={submitRename} />
            ))}
          </div>
        )}

        <div className="px-2 py-1">
          {normal.map(c => (
            <ConversationItem key={c.id} conv={c} active={activeConv?.id === c.id}
              onSelect={onSelect} onPin={() => onUpdate(c.id, { is_pinned: !c.is_pinned })}
              onDelete={onDelete} onRename={startRename}
              renaming={renaming} renameValue={renameValue} setRenameValue={setRenameValue} submitRename={submitRename} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="px-6 py-8 text-center">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ConversationItem({ conv, active, onSelect, onPin, onDelete, onRename, renaming, renameValue, setRenameValue, submitRename }: any) {
  const isRenaming = renaming === conv.id

  if (isRenaming) {
    return (
      <div className="px-2 py-1">
        <Input autoFocus className="h-8 text-sm" value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={submitRename}
          onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') submitRename() }} />
      </div>
    )
  }

  return (
    <div className={cn(
      "group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-all",
      active ? "bg-primary/10 text-primary" : "hover:bg-accent/50 text-foreground/80"
    )}
      onClick={() => onSelect(conv)}>
      {conv.is_pinned ? <Pin className="h-3.5 w-3.5 flex-shrink-0 text-primary" /> :
        conv.is_favorite ? <Star className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500" /> :
          <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />}
      <span className="flex-1 truncate">{conv.title}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="hidden group-hover:flex items-center opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded hover:bg-accent"
            onClick={e => e.stopPropagation()}>
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem onClick={() => onRename(conv)}>Rename</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPin(conv)}>{conv.is_pinned ? 'Unpin' : 'Pin'}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect(conv)}>Favorite</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect(conv)}>Archive</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(conv.id)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
