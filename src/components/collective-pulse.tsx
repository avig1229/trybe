'use client'

import { useState, useMemo, useEffect } from 'react'
import { Post, Project, Tribe } from '@/types'
import { Button } from '@/components/ui/button'
import { ForestViewport } from './pulse/ForestViewport'
import { ProjectTree } from './pulse/ProjectTree'
import { Plus, Maximize2, Layers } from 'lucide-react'
import { getTribeProjects } from '@/lib/supabase/queries'

interface CollectivePulseProps {
  posts: Post[]
  projects: Project[]
  userTribes?: Tribe[]
  currentUserId?: string
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
  userTribes = [],
  currentUserId,
  onCreatePost,
  // onLikePost,
  // onCommentPost,
  // onSavePost,
  onViewPost
}: CollectivePulseProps) {
  const [theme] = useState<Theme>('amber')
  const [zoom, setZoom] = useState(1.0)
  const [activeTribeId, setActiveTribeId] = useState<string | null>(null)
  const [tribeProjectsCache, setTribeProjectsCache] = useState<Record<string, Project[]>>({})

  // Load tribe projects when a tribe tab is selected (cached)
  useEffect(() => {
    if (!activeTribeId) return
    if (tribeProjectsCache[activeTribeId]) return
    getTribeProjects(activeTribeId).then(tribeProjs => {
      setTribeProjectsCache(prev => ({ ...prev, [activeTribeId]: tribeProjs }))
    })
  }, [activeTribeId, tribeProjectsCache])

  // Which projects to show — all (global) or tribe-filtered
  const activeProjects = useMemo(() => {
    if (!activeTribeId) return projects
    return tribeProjectsCache[activeTribeId] || []
  }, [activeTribeId, projects, tribeProjectsCache])

  // Group posts by project and distribute trees spatially
  const projectsWithTrees = useMemo(() => {
    const postMap = new Map<string, Post[]>()
    posts.forEach(post => {
      if (post.projectId) {
        const existing = postMap.get(post.projectId) || []
        postMap.set(post.projectId, [...existing, post])
      }
    })

    // Sort such that user's projects are at the center (start of array for Fermat's Spiral)
    // and randomizing the order of the rest.
    const userProjs = activeProjects.filter(p => p.userId === currentUserId)
    const otherProjs = activeProjects
      .filter(p => p.userId !== currentUserId)
      .sort(() => Math.random() - 0.5) // Randomize others

    const sortedProjects = [...userProjs, ...otherProjs]

    return sortedProjects.map((project, index) => {
      // Fermat's Spiral Distribution
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
  }, [posts, activeProjects, currentUserId])

  return (
    <div className="relative w-full h-full bg-transparent overflow-hidden font-mono transition-colors duration-700">
      {/* Header / Controls Overlay */}
      <header className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-2xl font-bold tracking-tighter text-white">THE FOREST</h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] mt-1">Spatial Collective Pulse</p>
        </div>

        {/* Tribe tabs */}
        {userTribes.length > 0 && (
          <div className="pointer-events-auto flex items-center gap-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 shadow-xl">
            <button
              onClick={() => setActiveTribeId(null)}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest transition-all font-mono ${
                activeTribeId === null
                  ? 'bg-white text-black font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Global
            </button>
            {userTribes.map(tribe => (
              <button
                key={tribe.id}
                onClick={() => setActiveTribeId(tribe.id)}
                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest transition-all font-mono ${
                  activeTribeId === tribe.id
                    ? 'bg-white text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tribe.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Spatial Viewport */}
      <ForestViewport zoom={zoom}>
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
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-black/80 backdrop-blur-xl p-1 border border-white/10 rounded-full shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-12 h-12 hover:bg-white/10 text-white"
          onClick={onCreatePost}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="w-px h-6 bg-white/10 my-auto mx-2" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 px-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 hover:bg-white/10 text-white font-bold"
            onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))}
          >
            -
          </Button>
          <span className="text-[9px] text-white/50 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 hover:bg-white/10 text-white font-bold"
            onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
          >
            +
          </Button>
        </div>

        <div className="w-px h-6 bg-white/10 my-auto mx-2" />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-12 h-12 hover:bg-white/10 text-neutral-400"
          onClick={() => setZoom(1.0)}
        >
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
