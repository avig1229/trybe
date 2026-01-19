'use client'

import { useState, useMemo } from 'react'
import { Post, Project } from '@/types'
import { Button } from '@/components/ui/button'
import { ForestViewport } from './pulse/ForestViewport'
import { ProjectTree } from './pulse/ProjectTree'
import { Plus, Maximize2, Layers } from 'lucide-react'

interface CollectivePulseProps {
  posts: Post[]
  projects: Project[]
  onCreatePost: () => void
  onLikePost: (postId: string) => void
  onCommentPost: (postId: string) => void
  onSavePost: (postId: string) => void
  onViewPost: (post: Post) => void
}

type Theme = 'amber' | 'green' | 'cga' | 'gameboy'

export function CollectivePulse({
  posts,
  projects,
  onCreatePost,
  // onLikePost,
  // onCommentPost,
  // onSavePost,
  onViewPost
}: CollectivePulseProps) {
  const [theme, setTheme] = useState<Theme>('amber')

  // Group posts by project for tree rendering
  const projectsWithTrees = useMemo(() => {
    const postMap = new Map<string, Post[]>()
    posts.forEach(post => {
      if (post.projectId) {
        const existing = postMap.get(post.projectId) || []
        postMap.set(post.projectId, [...existing, post])
      }
    })

    return projects.map((project, index) => {
      // Fermat's Spiral Distribution
      // Ensure trees are spread out predictably and beautifully
      const angle = index * (Math.PI * (3 - Math.sqrt(5))) // Golden Angle
      const radius = 400 * Math.sqrt(index) // Tighter spread, starts at center

      const defaultX = Math.cos(angle) * radius
      const defaultY = Math.sin(angle) * radius

      return {
        project: {
          ...project,
          forestX: project.forestX || defaultX,
          forestY: project.forestY || defaultY
        },
        posts: postMap.get(project.id) || []
      }
    })
  }, [posts, projects])

  return (
    <div className="relative w-full h-[calc(100vh-100px)] bg-black overflow-hidden font-mono">
      {/* Header / Controls Overlay */}
      <header className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-2xl font-bold tracking-tighter text-white">THE FOREST</h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] mt-1">Spatial Collective Pulse</p>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          {(['amber', 'green', 'cga', 'gameboy'] as Theme[]).map(t => (
            <Button
              key={t}
              variant={theme === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme(t)}
              className="uppercase text-[9px] h-7 rounded-none border-white/10 transition-all font-mono"
            >
              {t}
            </Button>
          ))}
        </div>
      </header>

      {/* Spatial Viewport */}
      <ForestViewport>
        <div className="relative w-[4000px] h-[4000px]"> {/* Large virtual space */}
          {projectsWithTrees.map(({ project, posts }, index) => (
            <div
              key={project.id}
              className="absolute transition-transform duration-500 hover:z-10"
              style={{
                left: `calc(50% + ${project.forestX || 0}px)`,
                top: `calc(50% + ${project.forestY || 0}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <ProjectTree
                project={project}
                posts={posts}
                theme={theme}
                onNodeClick={onViewPost}
              />
            </div>
          ))}
        </div>
      </ForestViewport>

      {/* CRT Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%] opacity-20" />

      {/* Floating Action Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-black/80 backdrop-blur-xl p-1 border border-white/10 rounded-full shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-12 h-12 hover:bg-white/10 text-white"
          onClick={onCreatePost}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="w-px h-6 bg-white/10 my-auto mx-2" />
        <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/10 text-neutral-400">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white/10 text-neutral-400">
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* UI Accents */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 space-y-4 opacity-20 pointer-events-none hidden md:block">
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-white to-transparent" />
        <span className="text-[8px] rotate-180 [writing-mode:vertical-lr] uppercase tracking-[0.5em]">Nav_Map_V.01</span>
      </div>

      <style jsx global>{`
        .image-render-pixelated {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  )
}
