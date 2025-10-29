'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getProjects, getChannels, getBlocks } from '@/lib/supabase/queries'
import { Project, Channel, Block } from '@/types'
import { ArrowLeft, Target, FileText, Video, Plus, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

type Tab = 'overview' | 'resources' | 'progress'

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params?.projectId as string

  const [project, setProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!projectId || !user) return
      setLoading(true)
      try {
        // Load all projects for sidebar
        const projs = await getProjects(user.id)
        setProjects(projs)
        
        // Find current project
        const current = projs.find(p => p.id === projectId)
        if (!current) {
          router.push('/valley')
          return
        }
        setProject(current)

        // Load channels and blocks for resources
        const chans = await getChannels(projectId)
        setChannels(chans)
        
        // Load blocks from all channels
        const allBlocks = await Promise.all(
          chans.map(c => getBlocks(c.id))
        )
        setBlocks(allBlocks.flat())
      } catch (e) {
        console.error('Error loading project:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId, user?.id, router])

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) return null

  const totalResources = blocks.length
  const progressUpdates = 0 // TODO: count from video posts
  
  // Calculate days active safely
  const createdAt = project.createdAt instanceof Date 
    ? project.createdAt 
    : new Date(project.createdAt)
  const daysActive = isNaN(createdAt.getTime()) 
    ? 0 
    : Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border bg-card overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">My Projects</h2>
          <p className="text-sm text-muted-foreground mb-4">Your creative portfolio</p>
          
          <div className="space-y-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/valley/${p.id}`)}
                className={cn(
                  "w-full text-left p-4 rounded-lg transition-colors",
                  p.id === projectId 
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white" 
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-3 h-3 rounded-full mt-1", p.color || 'bg-neutral-900')} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{p.name}</h3>
                    <p className="text-xs opacity-80 line-clamp-2 mt-1">
                      {p.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className={cn("px-2 py-0.5 rounded", p.status === 'active' ? 'bg-green-500/20 text-green-700' : 'bg-gray-500/20')}>
                        {p.status}
                      </span>
                      <span>{totalResources} resources</span>
                      <span>{progressUpdates} updates</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/valley')}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>

            <div className="flex items-start gap-3">
              <div className={cn("w-4 h-4 rounded-full mt-1", project.color || 'bg-neutral-900')} />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <Badge variant="outline" className={project.status === 'active' ? 'border-green-500 text-green-700' : ''}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {project.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'overview'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === 'resources'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              Resources
              <span className="px-1.5 py-0.5 bg-muted rounded text-xs">{totalResources}</span>
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === 'progress'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Video className="h-4 w-4" />
              Progress
              <span className="px-1.5 py-0.5 bg-muted rounded text-xs">{progressUpdates}</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium opacity-90">
                      Total Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalResources}</div>
                    <p className="text-sm opacity-90 mt-1">Organized references</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium opacity-90">
                      Progress Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{progressUpdates}</div>
                    <p className="text-sm opacity-90 mt-1">Video documentation</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium opacity-90">
                      Days Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{daysActive}</div>
                    <p className="text-sm opacity-90 mt-1">
                      Since {new Date(createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Progress Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Progress</h2>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {totalResources === 0 ? (
                    <Card className="col-span-2 text-center py-12">
                      <CardContent>
                        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No progress updates yet</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Update
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="group cursor-pointer">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <Video className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-medium">Latest Update</p>
                          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Project Resources</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>

              {blocks.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No resources yet</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Resource
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blocks.map((block) => (
                    <Card key={block.id} className="group">
                      <CardHeader>
                        <CardTitle className="text-base">{block.title || 'Untitled'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {block.content}
                        </p>
                        <Badge variant="outline" className="mt-3">{block.type}</Badge>
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
                <h2 className="text-xl font-semibold">Progress Updates</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Update
                </Button>
              </div>

              <Card className="text-center py-12">
                <CardContent>
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No progress updates yet</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Update
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
