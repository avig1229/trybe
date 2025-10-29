'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/navigation'
import { Dashboard } from '@/components/dashboard'
import { ProjectValley } from '@/components/project-valley'
import ProjectDashboard from '@/components/ProjectDashboard'
import ProjectList from '@/components/ProjectList'
import { CollectivePulse } from '@/components/collective-pulse'
import { Tribes } from '@/components/tribes'
import { Loader2 } from 'lucide-react'
import { View, Project, Post, Tribe } from '@/types'
import { getProjects, createProject, deleteProject } from '@/lib/supabase/queries'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ValleyPage() {
  const { user, profile, loading } = useAuth()
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const router = useRouter()
  
  // State for data
  const [projects, setProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState<number>(320)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true)
  const [projectsError, setProjectsError] = useState<string>('')

  // Create project dialog state
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newIsPublic, setNewIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return
      setLoadingProjects(true)
      setProjectsError('')
      try {
        const data = await getProjects(user.id)
        setProjects(data)
        if (!selectedProjectId && data.length > 0) {
          setSelectedProjectId(data[0].id)
        }
      } catch (e) {
        setProjectsError('Failed to load projects')
      } finally {
        setLoadingProjects(false)
      }
    }

    if (user && profile) {
      loadProjects()

      setPosts([
        {
          id: '1',
          userId: user.id,
          type: 'progress',
          title: 'Making great progress!',
          content: 'Just finished the first iteration of my design system. Feeling excited about the direction this is taking.',
          isFeatured: false,
          viewCount: 24,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          likeCount: 8,
          commentCount: 3,
          isLiked: false,
          isSaved: false,
        },
      ])

      setTribes([
        {
          id: '1',
          name: 'Design Enthusiasts',
          slug: 'design-enthusiasts',
          description: 'A community for designers to share inspiration and collaborate',
          creatorId: 'other-user',
          isPublic: true,
          memberCount: 156,
          postCount: 23,
          tags: ['design', 'ui', 'ux'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isMember: true,
          userRole: 'member',
        },
      ])
    }
  }, [user?.id, profile?.id]) // Only depend on IDs to prevent unnecessary re-renders

  const handleCreateProject = () => {
    setShowCreate(true)
  }

  const handleEditProject = (project: Project) => {
    console.log('Edit project:', project)
    // TODO: Implement project editing
  }

  const handleDeleteProject = (projectId: string) => {
    // Optimistic UI delete
    const next = projects.filter(p => p.id !== projectId)
    setProjects(next)
    // If deleting the selected project, select the first remaining (if any)
    if (selectedProjectId === projectId) {
      setSelectedProjectId(next.length ? next[0].id : null)
    }
    deleteProject(projectId).catch(() => {
      // rollback
      setProjects(projects)
      if (selectedProjectId === projectId) {
        setSelectedProjectId(projectId)
      }
    })
  }

  const handleViewProject = (project: Project) => {
    setSelectedProjectId(project.id)
  }

  const submitCreate = async () => {
    if (!user || !newName.trim()) return
    setCreating(true)
    const created = await createProject({
      userId: user.id,
      name: newName.trim(),
      description: newDescription || '',
      isPublic: newIsPublic,
      status: 'planning',
      color: 'bg-neutral-900',
    })
    setCreating(false)
    if (created) {
      setProjects(prev => [created, ...prev])
      setShowCreate(false)
      setNewName('')
      setNewDescription('')
      setNewIsPublic(true)
    }
  }

  const handleCreatePost = () => {
    console.log('Create post')
    // TODO: Implement post creation modal
  }

  const handleLikePost = (postId: string) => {
    console.log('Like post:', postId)
    // TODO: Implement like functionality
  }

  const handleCommentPost = (postId: string) => {
    console.log('Comment on post:', postId)
    // TODO: Implement comment functionality
  }

  const handleSavePost = (postId: string) => {
    console.log('Save post:', postId)
    // TODO: Implement save functionality
  }

  const handleViewPost = (post: Post) => {
    console.log('View post:', post)
    // TODO: Navigate to post detail page
  }

  const handleCreateTribe = () => {
    console.log('Create tribe')
    // TODO: Implement tribe creation modal
  }

  const handleJoinTribe = (tribeId: string) => {
    console.log('Join tribe:', tribeId)
    // TODO: Implement join tribe functionality
  }

  const handleLeaveTribe = (tribeId: string) => {
    console.log('Leave tribe:', tribeId)
    // TODO: Implement leave tribe functionality
  }

  const handleEditTribe = (tribe: Tribe) => {
    console.log('Edit tribe:', tribe)
    // TODO: Implement tribe editing
  }

  const handleViewTribe = (tribe: Tribe) => {
    console.log('View tribe:', tribe)
    // TODO: Navigate to tribe detail page
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need to be logged in to access this page.</p>
        </div>
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            profile={profile}
            projects={projects}
            posts={posts}
            tribes={tribes}
            onCreateProject={handleCreateProject}
            onCreatePost={handleCreatePost}
            onCreateTribe={handleCreateTribe}
            onViewProject={handleViewProject}
            onViewPost={handleViewPost}
            onViewTribe={handleViewTribe}
          />
        )
      case 'valley':
        return (
          <div className="min-h-[70vh] grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
            <div style={{ width: sidebarCollapsed ? 56 : sidebarWidth }} className="transition-[width] overflow-hidden relative">
              <div className="flex items-center justify-between mb-3">
                {!sidebarCollapsed ? (
                  <>
                    <h3 className="text-sm font-semibold">Projects</h3>
                    <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(true)}>
                      Collapse
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(false)}>
                    Expand
                  </Button>
                )}
              </div>
              <ProjectList
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelect={handleViewProject}
                onCreate={handleCreateProject}
                onDelete={handleDeleteProject}
              />
              {/* Resize handle */}
              {!sidebarCollapsed && (
                <div
                  onMouseDown={(e) => {
                    const startX = e.clientX
                    const startW = sidebarWidth
                    const onMove = (ev: MouseEvent) => {
                      const delta = ev.clientX - startX
                      const next = Math.min(500, Math.max(220, startW + delta))
                      setSidebarWidth(next)
                    }
                    const onUp = () => {
                      window.removeEventListener('mousemove', onMove)
                      window.removeEventListener('mouseup', onUp)
                    }
                    window.addEventListener('mousemove', onMove)
                    window.addEventListener('mouseup', onUp)
                  }}
                  className="w-1 cursor-col-resize bg-transparent hover:bg-muted rounded-full h-full absolute right-0 top-0"
                />
              )}
              {sidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(false)}
                  className="absolute -right-10 top-2"
                >
                  Expand
                </Button>
              )}
            </div>
            <div>
              {selectedProjectId && projects.find(p => p.id === selectedProjectId) ? (
                <ProjectDashboard
                  project={projects.find(p => p.id === selectedProjectId)}
                  onProjectUpdated={(p) => {
                    setProjects(prev => prev.map(x => x.id === p.id ? p : x))
                  }}
                />
              ) : (
                <Card className="p-8">
                  <CardHeader>
                    <CardTitle>Select a project to view its dashboard</CardTitle>
                  </CardHeader>
                </Card>
              )}
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                  <DialogDescription>Organize your work in a new project.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Name</label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="My Awesome Project" />
                  </div>
                  <div>
                    <label className="text-sm">Description</label>
                    <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="What is this about?" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="public" type="checkbox" checked={newIsPublic} onChange={(e) => setNewIsPublic(e.target.checked)} />
                    <label htmlFor="public" className="text-sm">Make project public</label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button onClick={submitCreate} disabled={!newName.trim() || creating}>{creating ? 'Creating…' : 'Create Project'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )
      case 'pulse':
        return (
          <CollectivePulse
            posts={posts}
            projects={projects}
            onCreatePost={handleCreatePost}
            onLikePost={handleLikePost}
            onCommentPost={handleCommentPost}
            onSavePost={handleSavePost}
            onViewPost={handleViewPost}
          />
        )
      case 'tribes':
        return (
          <Tribes
            tribes={tribes}
            onCreateTribe={handleCreateTribe}
            onJoinTribe={handleJoinTribe}
            onLeaveTribe={handleLeaveTribe}
            onEditTribe={handleEditTribe}
            onViewTribe={handleViewTribe}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>
    </div>
  )
}
