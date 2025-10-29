'use client'

import { useState } from 'react'
import { Project } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

export default function ProjectList({
  projects,
  selectedProjectId,
  onSelect,
  onCreate,
  onDelete,
}: {
  projects: Project[]
  selectedProjectId: string | null
  onSelect: (project: Project) => void
  onCreate: () => void
  onDelete: (projectId: string) => void
}) {
  const [query, setQuery] = useState('')
  const getStatusClass = (s: Project['status']) => {
    switch (s) {
      case 'active': return 'bg-green-500/15 text-green-700 dark:text-green-400'
      case 'planning': return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
      case 'completed': return 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
      case 'paused': return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
      default: return 'bg-muted text-foreground'
    }
  }
  const filtered = projects.filter(p => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
  })

  const countBy = (status: Project['status']) => projects.filter(p => p.status === status).length
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Button size="sm" onClick={onCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full h-9 rounded-md border bg-background px-3 text-sm"
        />
      </div>

      {/* Tiny overview metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-muted p-2 flex items-center justify-between"><span>Active</span><span className="font-semibold">{countBy('active')}</span></div>
        <div className="rounded-md bg-muted p-2 flex items-center justify-between"><span>Planning</span><span className="font-semibold">{countBy('planning')}</span></div>
        <div className="rounded-md bg-muted p-2 flex items-center justify-between"><span>Completed</span><span className="font-semibold">{countBy('completed')}</span></div>
        <div className="rounded-md bg-muted p-2 flex items-center justify-between"><span>Paused</span><span className="font-semibold">{countBy('paused')}</span></div>
      </div>
      <div className="space-y-2">
        {filtered.map((p) => (
          <div
            key={p.id}
            className={cn(
              'p-3 rounded-md border hover:bg-muted cursor-pointer flex items-start justify-between gap-2',
              selectedProjectId === p.id && 'bg-muted'
            )}
            onClick={() => onSelect(p)}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn('w-2.5 h-2.5 rounded-full', p.color || 'bg-neutral-900')} />
                <div className="text-sm font-medium truncate">{p.name}</div>
              </div>
              <div className="text-xs text-muted-foreground truncate mt-1">
                {p.description || 'No description'}
              </div>
              <div className="mt-1">
                <span className={cn('text-[11px] px-1.5 py-0.5 rounded capitalize', getStatusClass(p.status))}>{p.status}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete project "${p.name}"?`)) onDelete(p.id)
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
