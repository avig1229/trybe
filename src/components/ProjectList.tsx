'use client'

import { useState } from 'react'
import { Project } from '@/types'
import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

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

  const filtered = projects.filter(p => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-8 pr-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] opacity-50">Projects</h2>
        <button
          onClick={onCreate}
          className="text-[10px] uppercase tracking-widest hover:underline decoration-1 underline-offset-4"
        >
          + New
        </button>
      </div>

      <div className="relative group">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH..."
          className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-2 text-sm uppercase tracking-wider placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
        />
      </div>

      <div className="space-y-1">
        {filtered.map((p) => (
          <div
            key={p.id}
            className={cn(
              'group flex items-center justify-between py-3 cursor-pointer transition-all duration-300 border-b border-transparent hover:border-neutral-800',
              selectedProjectId === p.id ? 'opacity-100 pl-4 border-l-2 border-l-black dark:border-l-white border-b-neutral-800' : 'opacity-60 hover:opacity-100 hover:pl-2'
            )}
            onClick={() => onSelect(p)}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className={cn('w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125',
                  p.status === 'active' ? 'bg-black dark:bg-white' : 'bg-neutral-600'
                )} />
                <div className={cn("text-sm uppercase tracking-wide truncate transition-all", selectedProjectId === p.id ? "font-bold" : "font-normal")}>
                  {p.name}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete project "${p.name}"?`)) onDelete(p.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-500 transition-all"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
