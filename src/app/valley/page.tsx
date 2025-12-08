'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/navigation'
import { Dashboard } from '@/components/dashboard'
import ProjectDashboard from '@/components/ProjectDashboard'
import ProjectList from '@/components/ProjectList'
import { CollectivePulse } from '@/components/collective-pulse'
import { Tribes } from '@/components/tribes'
import { Loader2, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { View, Project, Post, Tribe } from '@/types'
// ... imports ...
import { HomeDashboard } from '@/components/HomeDashboard'
import { getPosts, getProjects, getUserProjects, createProject, deleteProject } from '@/lib/supabase/queries'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getDailyLockStatus } from '@/lib/daily-lock'
import { ContributionGraph } from '@/components/ContributionGraph'
import DailyCheckIn from '@/components/DailyCheckIn'


export default function ValleyPage() {
  const { user, profile, loading } = useAuth()
  // ... existing state ...
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [globalPosts, setGlobalPosts] = useState<Post[]>([]) // For HomeDashboard

  // State for data
  const [projects, setProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState<number>(320)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const [isLocked, setIsLocked] = useState<boolean | null>(null) // null = loading

  // Create project dialog state
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newIsPublic, setNewIsPublic] = useState(true)
  const [creating, setCreating] = useState(false)

  // ... useEffect for checking lock ...
  useEffect(() => {
    const checkLock = async () => {
      if (user) {
        console.log('Checking lock status for user:', user.id)
        const { isLocked } = await getDailyLockStatus(user.id)
        console.log('Lock status result:', isLocked)
        setIsLocked(isLocked)
      }
    }
    checkLock()
  }, [user])

  useEffect(() => {
    const loadProjectsAndPosts = async () => {
      if (!user) return
      try {
        // Fetch projects
        const data = await getUserProjects(user.id)
        setProjects(data)
        // No auto-select first project anymore

        // Fetch recent posts for Global Reel (active ecosystem)
        const recent = await getPosts(20, 0, undefined, user.id)
        setGlobalPosts(recent)
      } catch (e) {
        console.error(e)
      }
    }

    if (user && profile) {
      loadProjectsAndPosts()

      setPosts([
        // ... keeping mock posts for 'pulse' view locally if needed, 
      ])
      // ... tribes mock data ...
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
  }, [user, profile])

  const handleCreateProject = () => {
    setShowCreate(true)
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

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id)
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

  const handleUnlock = () => {
    setIsLocked(false)
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
            posts={globalPosts}
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
          <div className="min-h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
            <div
              className={cn(
                "transition-all duration-500 overflow-hidden relative hidden lg:block",
                sidebarCollapsed ? "w-12" : "w-[320px]"
              )}
            >
              <div className="sticky top-0 h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar space-y-12">
                {/* Collapse Toggle */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 hover-invert rounded-none border border-transparent hover:border-white transition-all"
                  >
                    {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                  </button>
                </div>

                {!sidebarCollapsed && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
                    {/* Daily Check-in Board */}
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] opacity-50">Daily Check-ins</h3>
                      {user && <ContributionGraph userId={user.id} />}
                    </div>

                    <ProjectList
                      projects={projects}
                      selectedProjectId={selectedProjectId}
                      onSelect={handleViewProject}
                      onCreate={handleCreateProject}
                      onDelete={handleDeleteProject}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Project List Toggle */}
            <div className="lg:hidden mb-8">
              <select
                className="w-full bg-transparent border-b border-white py-2 text-lg uppercase tracking-widest font-bold outline-none rounded-none"
                value={selectedProjectId || ''}
                onChange={(e) => {
                  const p = projects.find(proj => proj.id === e.target.value)
                  if (p) handleViewProject(p)
                }}
              >
                <option value="" disabled>SELECT PROJECT</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-black text-white">{p.name}</option>
                ))}
              </select>
            </div>

            <div className="min-h-[50vh]">
              {selectedProjectId && projects.find(p => p.id === selectedProjectId) ? (
                <ProjectDashboard
                  project={projects.find(p => p.id === selectedProjectId)}
                  onProjectUpdated={(p) => {
                    setProjects(prev => prev.map(x => x.id === p.id ? p : x))
                  }}
                />
              ) : (
                <HomeDashboard
                  profile={profile}
                  projects={projects}
                  recentPosts={globalPosts}
                  onSelectProject={handleSelectProject}
                  onCreateProject={handleCreateProject}
                />
              )}
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogContent className="sm:max-w-md border-none shadow-2xl bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold uppercase tracking-tighter">New Project</DialogTitle>
                  <DialogDescription className="text-xs uppercase tracking-widest">Initialize a new workspace</DialogDescription>
                </DialogHeader>
                <div className="space-y-8 py-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-50">Project Name</label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="UNTITLED PROJECT"
                      className="border-0 border-b border-neutral-200 dark:border-neutral-800 rounded-none px-0 text-xl font-medium uppercase tracking-wide focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-50">Description</label>
                    <Textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Brief abstract..."
                      className="border-0 border-b border-neutral-200 dark:border-neutral-800 rounded-none px-0 min-h-[100px] resize-none focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-neutral-300"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="public"
                      type="checkbox"
                      checked={newIsPublic}
                      onChange={(e) => setNewIsPublic(e.target.checked)}
                      className="w-4 h-4 rounded-none border-neutral-300 text-black focus:ring-black"
                    />
                    <label htmlFor="public" className="text-xs uppercase tracking-widest cursor-pointer select-none">Make Public</label>
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      onClick={() => setShowCreate(false)}
                      className="text-xs uppercase tracking-widest hover:opacity-50 transition-opacity"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitCreate}
                      disabled={!newName.trim() || creating}
                      className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 text-xs uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div >
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
      <main className="w-full px-4 md:px-8 py-8">
        {renderCurrentView()}
      </main>
      {isLocked && <DailyCheckIn onUnlock={handleUnlock} />}
    </div>
  )
}
