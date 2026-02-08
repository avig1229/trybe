import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Play, Edit2, Plus, Trash2, ChevronRight, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Project, Channel, Block, ProjectStatus, Post } from '@/types'
import { getChannels, getBlocks, updateProject, getPosts, createChannel, deleteChannel, updateChannel, getProjectBlocks } from '@/lib/supabase/queries'
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

  // Channel State
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [newChannelName, setNewChannelName] = useState('')
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [newSubChannelParentId, setNewSubChannelParentId] = useState<string | null>(null)

  // Renaming State
  const [renamingChannelId, setRenamingChannelId] = useState<string | null>(null)
  const [renamingName, setRenamingName] = useState('')

  useEffect(() => {
    if (project) setStatus(project.status)
  }, [project])

  const loadData = async () => {
    if (!project?.id) return
    // setLoading(true)
    const [chans, projectPosts, projectBlocks] = await Promise.all([
      getChannels(project.id),
      getPosts(20, 0, project.id),
      getProjectBlocks(project.id)
    ])
    setChannels(chans)
    setPosts(projectPosts)
    setBlocks(projectBlocks)

    // Select first channel if none selected, or if current selection is invalid
    if (chans.length > 0) {
      if (!selectedChannelId || !chans.find(c => c.id === selectedChannelId)) {
        setSelectedChannelId(chans[0].id)
      }
    } else {
      setSelectedChannelId(null)
    }
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

  const handleCreateChannel = async (parentId?: string) => {
    if (!project?.id || !newChannelName.trim()) return
    const created = await createChannel({
      projectId: project.id,
      parentId: parentId,
      name: newChannelName.trim(),
      color: 'bg-neutral-900', // Default color
      orderIndex: channels.length
    })
    if (created) {
      setNewChannelName('')
      setIsCreatingChannel(false)
      setNewSubChannelParentId(null)
      await loadData()
      setSelectedChannelId(created.id)
    }
  }

  const handleRenameChannel = async (channelId: string) => {
    if (!renamingName.trim()) return
    const updated = await updateChannel(channelId, { name: renamingName.trim() })
    if (updated) {
      setChannels(prev => prev.map(c => c.id === channelId ? updated : c))
      setRenamingChannelId(null)
      setRenamingName('')
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('Are you sure? This will delete all resources in this channel.')) return
    await deleteChannel(channelId)
    await loadData()
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
    <div className="w-full max-w-full mx-auto px-4 md:px-8 py-12 space-y-16">
      {/* Header - Ultra Minimal */}
      <div className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between border-b border-black/10 dark:border-white/10 pb-8 break-words">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter leading-none break-words max-w-full">{project?.name}</h1>
          <div className="flex items-center gap-6 shrink-0 ml-4">
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
        <p className="text-lg md:text-xl font-light max-w-3xl leading-relaxed">{project?.description || 'No description provided.'}</p>
      </div>

      {/* Navigation - Floating / Minimal */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-transparent transition-all duration-500 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-12 text-xs font-medium tracking-[0.2em] uppercase whitespace-nowrap">
          {(
            [
              { id: 'overview', label: 'Overview', desc: 'The big picture of your project' },
              { id: 'resources', label: 'Resources', desc: 'Organize your references and assets' },
              { id: 'progress', label: 'Progress', desc: 'Document your journey with updates' },
            ] as const
          ).map((t) => (
            <div key={t.id} className="flex flex-col gap-2">
              <button
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
              {activeTab === t.id && (
                <span className="text-[10px] opacity-40 font-light lowercase tracking-normal italic animate-in fade-in slide-in-from-top-1">
                  {t.desc}
                </span>
              )}
            </div>
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
                            preload="metadata"
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

            {/* 3. Project Notes */}
            <div className="border-t border-black/10 dark:border-white/10 pt-12">
              <div className="max-w-4xl mx-auto space-y-6">
                <h3 className="text-xs uppercase tracking-[0.2em] opacity-50 text-center">Project Notes</h3>
                <textarea
                  className="w-full bg-transparent text-xl md:text-2xl font-light leading-relaxed resize-none focus:outline-none min-h-[150px] placeholder:text-neutral-200 p-0 text-center"
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
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-12">
            {/* Channel Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-8 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                {/* Recursive Channel Rendering */}
                {channels.filter(c => !c.parentId).map(channel => (
                  <div key={channel.id} className="space-y-4">
                    <div className="group relative flex items-center gap-2">
                      {renamingChannelId === channel.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={renamingName}
                            onChange={(e) => setRenamingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameChannel(channel.id)
                              if (e.key === 'Escape') setRenamingChannelId(null)
                            }}
                            className="bg-transparent border-b border-black dark:border-white w-32 py-1 text-xs uppercase tracking-widest outline-none"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedChannelId(channel.id)}
                          className={cn(
                            "text-xs uppercase tracking-[0.2em] transition-all whitespace-nowrap hover:opacity-100",
                            selectedChannelId === channel.id ? "opacity-100 font-bold" : "opacity-40"
                          )}
                        >
                          {channel.name}
                          <span className="ml-2 opacity-50 text-[10px]">{channel.blockCount || 0}</span>
                        </button>
                      )}

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                        <button
                          onClick={() => {
                            setRenamingChannelId(channel.id)
                            setRenamingName(channel.name)
                          }}
                          className="hover:text-blue-500"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setIsCreatingChannel(true)
                            setNewSubChannelParentId(channel.id)
                          }}
                          className="hover:text-green-500"
                          title="Add Sub-channel"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteChannel(channel.id)}
                          className="hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Sub-channels */}
                    <div className="pl-6 space-y-2 border-l border-black/5 dark:border-white/5 ml-1">
                      {channels.filter(sub => sub.parentId === channel.id).map(sub => (
                        <div key={sub.id} className="group flex items-center gap-2">
                          {renamingChannelId === sub.id ? (
                            <input
                              autoFocus
                              value={renamingName}
                              onChange={(e) => setRenamingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameChannel(sub.id)
                                if (e.key === 'Escape') setRenamingChannelId(null)
                              }}
                              className="bg-transparent border-b border-black dark:border-white w-24 py-0.5 text-[10px] uppercase tracking-widest outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => setSelectedChannelId(sub.id)}
                              className={cn(
                                "text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap hover:opacity-100",
                                selectedChannelId === sub.id ? "opacity-100 font-bold" : "opacity-40"
                              )}
                            >
                              {sub.name}
                              <span className="ml-1 opacity-50">{sub.blockCount || 0}</span>
                            </button>
                          )}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button onClick={() => { setRenamingChannelId(sub.id); setRenamingName(sub.name) }} className="hover:text-blue-500">
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button onClick={() => handleDeleteChannel(sub.id)} className="hover:text-red-500">
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {isCreatingChannel && newSubChannelParentId === channel.id && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                          <input
                            autoFocus
                            value={newChannelName}
                            onChange={(e) => setNewChannelName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCreateChannel(channel.id)
                              if (e.key === 'Escape') {
                                setIsCreatingChannel(false)
                                setNewSubChannelParentId(null)
                              }
                            }}
                            className="bg-transparent border-b border-black dark:border-white w-24 py-0.5 text-[10px] uppercase tracking-widest outline-none"
                            placeholder="SUB..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* New Top-level Channel Input */}
                {isCreatingChannel && !newSubChannelParentId ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                    <input
                      autoFocus
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateChannel()
                        if (e.key === 'Escape') setIsCreatingChannel(false)
                      }}
                      className="bg-transparent border-b border-black dark:border-white w-32 py-1 text-xs uppercase tracking-widest outline-none"
                      placeholder="NAME..."
                    />
                    <button onClick={() => handleCreateChannel()} className="text-[10px] uppercase font-bold hover:opacity-50">Add</button>
                    <button onClick={() => setIsCreatingChannel(false)} className="text-[10px] uppercase opacity-50 hover:opacity-100">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsCreatingChannel(true)
                      setNewSubChannelParentId(null)
                    }}
                    className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 whitespace-nowrap flex items-center gap-1"
                  >
                    + New Channel
                  </button>
                )}
              </div>

              <div className="flex justify-end shrink-0">
                {selectedChannelId && (
                  <ResourceUploadModal
                    projectId={project!.id}
                    channelId={selectedChannelId}
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
            </div>

            {/* Resources Grid */}
            {(() => {
              const filteredBlocks = blocks.filter(b => b.channelId === selectedChannelId)

              if (channels.length === 0) {
                return (
                  <div className="py-32 text-center text-neutral-400 font-light flex flex-col items-center gap-4">
                    <div>No channels yet.</div>
                    <button onClick={() => setIsCreatingChannel(true)} className="text-xs uppercase tracking-widest border-b border-black dark:border-white pb-1 hover:opacity-50">Create your first channel</button>
                  </div>
                )
              }

              if (filteredBlocks.length === 0) {
                return <div className="py-32 text-center text-neutral-400 font-light">No resources in this channel.</div>
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                  {filteredBlocks.map((b) => (
                    <div key={b.id} className="group space-y-6">
                      <div className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 p-8 flex flex-col justify-between transition-colors group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800">
                        <div className="uppercase text-[10px] tracking-[0.2em] opacity-40">{b.type}</div>
                        {b.type === 'image' || b.type === 'video' ? (
                          // If it's media, we might want to show a preview if content is a URL
                          // For now, just showing content text or a placeholder
                          <div className="flex-1 flex items-center justify-center overflow-hidden my-4">
                            {/* Simple check if content is a URL */}
                            {b.content.startsWith('http') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={b.content} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-screen" />
                            ) : (
                              <p className="text-sm leading-relaxed font-light line-clamp-6">{b.content}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed font-light overflow-y-auto no-scrollbar flex-1 my-4">{b.content}</p>
                        )}
                      </div>
                      <h4 className="text-lg uppercase tracking-widest font-medium truncate">{b.title || 'Untitled'}</h4>
                    </div>
                  ))}
                </div>
              )
            })()}
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
                        <div className={cn("w-full overflow-hidden flex justify-center bg-black/5 dark:bg-black/40", post.mediaType === 'video' ? "min-h-[400px] max-h-[80vh]" : "aspect-auto")}>
                          {post.mediaType === 'video' ? (
                            playingVideo === post.id ? (
                              <video
                                src={post.mediaUrl}
                                controls
                                preload="auto"
                                autoPlay
                                className="h-full w-auto max-w-full object-contain mx-auto"
                              />
                            ) : (
                              <div
                                onClick={() => setPlayingVideo(post.id)}
                                className="relative h-full w-auto max-w-full cursor-pointer flex justify-center"
                              >
                                <video
                                  preload="metadata"
                                  src={post.mediaUrl}
                                  className="h-full w-auto max-w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 rounded-full border border-white/50 flex items-center justify-center backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                                    <Play className="h-5 w-5 fill-white text-white ml-1" strokeWidth={1} />
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

