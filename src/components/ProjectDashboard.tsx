import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Project, Channel, Block, ProjectStatus, Post } from '@/types'
import { getChannels, getBlocks, updateProject, getPosts } from '@/lib/supabase/queries'
import { ResourceUploadModal } from './upload/ResourceUploadModal'
import { ProgressUploadModal } from './upload/ProgressUploadModal'
import { useAuth } from '@/contexts/AuthContext'

type Tab = 'overview' | 'resources' | 'progress'

export default function ProjectDashboard({ project, onProjectUpdated }: { project?: Project, onProjectUpdated?: (p: Project) => void }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [channels, setChannels] = useState<Channel[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  // const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'planning')
  const [showAllReels, setShowAllReels] = useState(false)
  // const statusClass = (s: ProjectStatus) => {
  //   switch (s) {
  //     case 'active': return 'bg-green-500/15 text-green-700 dark:text-green-400'
  //     case 'planning': return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
  //     case 'completed': return 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
  //     case 'paused': return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
  //     default: return 'bg-muted text-foreground'
  //   }
  // }

  useEffect(() => {
    if (project) setStatus(project.status)
  }, [project])

  const loadData = async () => {
    if (!project?.id) return
    // setLoading(true)
    const [chans, projectPosts] = await Promise.all([
      getChannels(project.id),
      getPosts(20, 0, project.id)
    ])
    setChannels(chans)
    setPosts(projectPosts)
    const allBlocks = await Promise.all(chans.map((c) => getBlocks(c.id)))
    setBlocks(allBlocks.flat())
    // setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as ProjectStatus
    setStatus(next)
    if (!project?.id) return
    const updated = await updateProject(project.id, { status: next })
    if (updated) onProjectUpdated?.(updated)
  }

  const totalResources = blocks.length
  const progressUpdates = posts.length
  if (!project) return null

  const createdAt = project.createdAt instanceof Date ? project.createdAt : new Date(project.createdAt)
  const daysActive = isNaN(createdAt.getTime())
    ? 0
    : Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  // Get default channel for uploads (first one or create one if needed - assuming first one exists for now)
  const defaultChannelId = channels.length > 0 ? channels[0].id : ''

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-12 py-16 space-y-20">
      {/* Header - Ultra Minimal */}
      <div className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between border-b border-black/10 dark:border-white/10 pb-8">
          <h1 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter leading-none">{project?.name}</h1>
          <div className="flex items-center gap-6">
            <select
              value={status}
              onChange={handleStatusChange}
              className="text-xs uppercase tracking-[0.2em] bg-transparent border-none outline-none cursor-pointer hover:opacity-50 transition-opacity"
            >
              {(['planning', 'active', 'completed', 'paused'] as const).map(s => (
                <option key={s} value={s} className="uppercase">{s}</option>
              ))}
            </select>
            <div className={cn('w-1.5 h-1.5 rounded-full',
              status === 'active' ? 'bg-black dark:bg-white' : 'bg-neutral-400'
            )} />
          </div>
        </div>
        <p className="text-xl md:text-2xl font-light max-w-3xl leading-relaxed">{project?.description || 'No description provided.'}</p>
      </div>

      {/* Navigation - Floating / Minimal */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-12 md:px-12 border-b border-transparent transition-all duration-500">
        <div className="flex items-center gap-12 text-xs font-medium tracking-[0.2em] uppercase">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'resources', label: 'Resources' },
              { id: 'progress', label: 'Progress' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as Tab)}
              className={cn(
                'transition-all duration-300 hover:opacity-100',
                activeTab === (t.id as Tab)
                  ? 'opacity-100'
                  : 'opacity-40'
              )}
            >
              {t.label}
              {t.id !== 'overview' && (
                <sup className="ml-1 opacity-60">
                  {t.id === 'resources' ? totalResources : progressUpdates}
                </sup>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[60vh]">
        {activeTab === 'overview' && (
          <div className="space-y-24">
            {/* 1. The Reel (Motion) - Horizontal Scroll */}
            {(() => {
              const videos = [...posts, ...blocks].filter(i =>
                (i as Post).mediaType === 'video' || (i as Block).type === 'video'
              )

              if (videos.length === 0) return null

              return (
                <div className="space-y-6">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xs uppercase tracking-[0.2em] opacity-50">The Reel</h3>
                    {videos.length > 3 && (
                      <button
                        onClick={() => setShowAllReels(!showAllReels)}
                        className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                      >
                        {showAllReels ? 'Show Less' : 'View All'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {videos.slice(0, showAllReels ? undefined : 3).map((item) => {
                      const isPost = 'mediaUrl' in item
                      const src = isPost ? (item as Post).mediaUrl : (item as Block).content
                      if (!src) return null

                      return (
                        <div key={item.id} className="aspect-[9/16] bg-neutral-100 dark:bg-neutral-900 relative group overflow-hidden">
                          <video
                            src={src}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            muted
                            loop
                            onMouseOver={e => {
                              const v = e.currentTarget
                              v.play().catch(() => { })
                            }}
                            onMouseOut={e => {
                              const v = e.currentTarget
                              v.pause()
                              v.currentTime = 0
                            }}
                          />
                          <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-xs uppercase tracking-widest font-bold truncate max-w-[200px]">{isPost ? (item as Post).title : (item as Block).title || 'Untitled'}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* 2. The Board (Stills) - Masonry Grid */}
            {(() => {
              const images = [...posts, ...blocks].filter(i =>
                (i as Post).mediaType === 'image' || (i as Block).type === 'image'
              )

              return (
                <div className="space-y-6">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xs uppercase tracking-[0.2em] opacity-50">The Board</h3>
                    <div className="text-[10px] uppercase tracking-widest opacity-40">{images.length} Items</div>
                  </div>

                  {images.length === 0 ? (
                    <div className="py-20 border border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-neutral-400 gap-4">
                      <div className="text-xs uppercase tracking-widest">Moodboard Empty</div>
                      <p className="text-sm font-light max-w-xs text-center">Upload images to Resources or post image Updates to build your board.</p>
                    </div>
                  ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                      {images.map((item) => {
                        const isPost = 'mediaUrl' in item
                        const src = isPost ? (item as Post).mediaUrl : (item as Block).content // Assuming block content is URL for images

                        return (
                          <div key={item.id} className="break-inside-avoid group cursor-pointer mb-8">
                            <div className="bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative">
                              <img
                                src={src}
                                alt=""
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                            <div className="mt-3 flex justify-between items-start opacity-50 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] uppercase tracking-widest truncate max-w-[70%]">
                                {isPost ? (item as Post).title : (item as Block).title || 'Untitled'}
                              </span>
                              <span className="text-[10px] uppercase tracking-widest">
                                {isPost ? 'Update' : 'Ref'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* 3. Project Notes & Stats */}
            <div className="border-t border-black/10 dark:border-white/10 pt-12 flex flex-col md:flex-row gap-12 md:gap-24">
              <div className="flex-1 space-y-6">
                <h3 className="text-xs uppercase tracking-[0.2em] opacity-50">Project Notes</h3>
                <textarea
                  className="w-full bg-transparent text-xl md:text-2xl font-light leading-relaxed resize-none focus:outline-none min-h-[150px] placeholder:text-neutral-200 p-0"
                  placeholder="Jot down your thoughts, direction, or manifesto for this project..."
                  value={project?.description || ''}
                  onChange={(e) => {
                    // Optimistic update - in a real app we'd debounce this
                    if (project && onProjectUpdated) {
                      onProjectUpdated({ ...project, description: e.target.value })
                    }
                  }}
                  onBlur={(e) => {
                    if (project) updateProject(project.id, { description: e.target.value })
                  }}
                />
              </div>
              <div className="w-full md:w-64 space-y-8 shrink-0">
                <div className="flex items-baseline justify-between border-b border-black/10 dark:border-white/10 pb-2">
                  <span className="text-xs uppercase tracking-[0.2em] opacity-50">Resources</span>
                  <span className="text-2xl font-light">{totalResources}</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-black/10 dark:border-white/10 pb-2">
                  <span className="text-xs uppercase tracking-[0.2em] opacity-50">Updates</span>
                  <span className="text-2xl font-light">{progressUpdates}</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-black/10 dark:border-white/10 pb-2">
                  <span className="text-xs uppercase tracking-[0.2em] opacity-50">Days Active</span>
                  <span className="text-2xl font-light">{daysActive}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-12">
            <div className="flex justify-end">
              {defaultChannelId && (
                <ResourceUploadModal
                  projectId={project!.id}
                  channelId={defaultChannelId}
                  userId={user?.id || project!.userId}
                  onSuccess={loadData}
                  trigger={
                    <button className="text-[10px] uppercase tracking-[0.2em] border border-black dark:border-white px-6 py-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                      + Add Resource
                    </button>
                  }
                />
              )}
            </div>

            {blocks.length === 0 ? (
              <div className="py-32 text-center text-neutral-400 font-light">No resources yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                {blocks.map((b) => (
                  <div key={b.id} className="group space-y-6">
                    <div className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 p-8 flex flex-col justify-between transition-colors group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800">
                      <div className="uppercase text-[10px] tracking-[0.2em] opacity-40">{b.type}</div>
                      <p className="text-sm leading-relaxed font-light">{b.content}</p>
                    </div>
                    <h4 className="text-lg uppercase tracking-widest font-medium">{b.title || 'Untitled'}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-12">
            <div className="flex justify-end">
              <ProgressUploadModal
                projectId={project!.id}
                userId={user?.id || project!.userId}
                onSuccess={loadData}
                trigger={
                  <button className="text-[10px] uppercase tracking-[0.2em] border border-black dark:border-white px-6 py-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                    + New Update
                  </button>
                }
              />
            </div>

            {posts.length === 0 ? (
              <div className="py-32 text-center text-neutral-400 font-light">No progress updates yet.</div>
            ) : (
              <div className="space-y-32">
                {posts.map((post) => (
                  <div key={post.id} className="group">
                    {/* Media - Full Width / Cinematic */}
                    <div className="w-full mb-8 bg-neutral-100 dark:bg-neutral-900 relative">
                      {post.mediaUrl ? (
                        <div className={cn("w-full overflow-hidden", post.mediaType === 'video' ? "aspect-video" : "aspect-auto")}>
                          {post.mediaType === 'video' ? (
                            playingVideo === post.id ? (
                              <video
                                src={post.mediaUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div
                                onClick={() => setPlayingVideo(post.id)}
                                className="relative w-full h-full cursor-pointer"
                              >
                                <video
                                  src={post.mediaUrl}
                                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-20 h-20 rounded-full border border-white/50 flex items-center justify-center backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                                    <Play className="h-6 w-6 fill-white text-white ml-1" strokeWidth={1} />
                                  </div>
                                </div>
                              </div>
                            )
                          ) : post.mediaType === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.mediaUrl} alt="" className="w-full h-auto max-h-[85vh] object-contain mx-auto" />
                          ) : (
                            <div className="py-32 flex flex-col items-center justify-center text-neutral-500">
                              <FileText className="h-12 w-12 mb-4 opacity-20" strokeWidth={1} />
                              <span className="uppercase tracking-[0.2em] text-xs mb-6">{post.mediaUrl.split('/').pop()}</span>
                              <Button
                                variant="outline"
                                className="rounded-none border-neutral-200 dark:border-neutral-800 uppercase tracking-widest text-[10px]"
                                onClick={() => window.open(post.mediaUrl, '_blank')}
                              >
                                Download File
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-24 flex items-center justify-center">
                          <span className="text-neutral-400 italic font-light">No media content</span>
                        </div>
                      )}
                    </div>

                    {/* Content - Minimal & Centered */}
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                      <div className="flex items-center justify-center gap-4">
                        <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter">{post.title || 'Untitled Update'}</h2>
                        <ProgressUploadModal
                          projectId={project!.id}
                          userId={user?.id || project!.userId}
                          post={post}
                          onSuccess={loadData}
                          trigger={
                            <button className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity text-[10px] uppercase tracking-widest border-b border-black dark:border-white pb-0.5">
                              Edit
                            </button>
                          }
                        />
                      </div>
                      <p className="text-lg md:text-xl font-light leading-relaxed text-neutral-600 dark:text-neutral-300">{post.content}</p>

                      <div className="pt-8 flex items-center justify-center gap-8 text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>—</span>
                        <span>{post.likeCount || 0} Likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

