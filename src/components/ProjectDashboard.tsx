import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Video, Target, Plus, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Project, Channel, Block, ProjectStatus, Post } from '@/types'
import { getChannels, getBlocks, updateProject, getPosts } from '@/lib/supabase/queries'
import { ResourceUploadModal } from './upload/ResourceUploadModal'
import { ProgressUploadModal } from './upload/ProgressUploadModal'

type Tab = 'overview' | 'resources' | 'progress'

export default function ProjectDashboard({ project, onProjectUpdated }: { project?: Project, onProjectUpdated?: (p: Project) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [channels, setChannels] = useState<Channel[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'planning')
  const statusClass = (s: ProjectStatus) => {
    switch (s) {
      case 'active': return 'bg-green-500/15 text-green-700 dark:text-green-400'
      case 'planning': return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
      case 'completed': return 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
      case 'paused': return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
      default: return 'bg-muted text-foreground'
    }
  }

  useEffect(() => {
    if (project) setStatus(project.status)
  }, [project?.id, project?.status])

  const loadData = async () => {
    if (!project?.id) return
    setLoading(true)
    const [chans, projectPosts] = await Promise.all([
      getChannels(project.id),
      getPosts(20, 0, project.id)
    ])
    setChannels(chans)
    setPosts(projectPosts)
    const allBlocks = await Promise.all(chans.map((c) => getBlocks(c.id)))
    setBlocks(allBlocks.flat())
    setLoading(false)
  }

  useEffect(() => {
    loadData()
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn('w-3 h-3 rounded-full mt-2', project.color || 'bg-neutral-900')} />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <select
              value={status}
              onChange={handleStatusChange}
              className="text-xs border rounded px-2 py-1 capitalize bg-background"
            >
              {(['planning', 'active', 'completed', 'paused'] as const).map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
            <Badge variant="outline" className={"capitalize " + statusClass(status)}>{status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{project.description || 'No description provided.'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(
          [
            { id: 'overview', icon: Target, label: 'Overview' },
            { id: 'resources', icon: FileText, label: 'Resources' },
            { id: 'progress', icon: Video, label: 'Progress' },
          ] as const
        ).map((t) => {
          const Icon = t.icon
          const isActive = activeTab === (t.id as Tab)
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as Tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                isActive ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {t.id === 'resources' && (
                <span className="px-1.5 py-0.5 bg-muted rounded text-xs">{totalResources}</span>
              )}
              {t.id === 'progress' && (
                <span className="px-1.5 py-0.5 bg-muted rounded text-xs">{progressUpdates}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalResources}</div>
                <p className="text-sm text-muted-foreground mt-1">Organized references</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Progress Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{progressUpdates}</div>
                <p className="text-sm text-muted-foreground mt-1">Video documentation</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Days Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{daysActive}</div>
                <p className="text-sm text-muted-foreground mt-1">Since {new Date(createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-sm text-muted-foreground">No recent updates</div>
              ) : (
                <div className="space-y-4">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex gap-4 items-start pb-4 border-b last:border-0 last:pb-0">
                      {post.thumbnailUrl ? (
                        <div className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <Video className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-sm">{post.title || 'Untitled Update'}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Project Resources</h3>
            {defaultChannelId && (
              <ResourceUploadModal
                projectId={project.id}
                channelId={defaultChannelId}
                userId={project.userId}
                onSuccess={loadData}
              />
            )}
          </div>
          {blocks.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="text-sm text-muted-foreground">No resources yet</div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blocks.map((b) => (
                <Card key={b.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{b.title || 'Untitled'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{b.content}</p>
                    <Badge variant="outline" className="mt-3 capitalize">{b.type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Progress Updates</h3>
            <ProgressUploadModal
              projectId={project.id}
              userId={project.userId}
              onSuccess={loadData}
            />
          </div>
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="text-sm text-muted-foreground">No progress updates yet</div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  {post.mediaUrl && (
                    <div className="aspect-video bg-muted relative group">
                      {post.mediaType === 'video' ? (
                        playingVideo === post.id ? (
                          <video
                            src={post.mediaUrl}
                            controls
                            autoPlay
                            className="w-full h-full object-contain bg-black"
                          />
                        ) : (
                          <button
                            onClick={() => setPlayingVideo(post.id)}
                            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                              <Play className="h-5 w-5 fill-current ml-0.5" />
                            </div>
                          </button>
                        )
                      ) : post.mediaType === 'image' ? (
                        <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center">
                          <FileText className="h-12 w-12 mb-2 opacity-50" />
                          <span className="text-xs font-medium truncate max-w-[200px]">
                            {post.mediaUrl.split('/').pop()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => window.open(post.mediaUrl, '_blank')}
                          >
                            View File
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold">{post.title || 'Untitled Update'}</h4>
                      <ProgressUploadModal
                        projectId={project.id}
                        userId={project.userId}
                        post={post}
                        onSuccess={loadData}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.likeCount || 0} likes</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

