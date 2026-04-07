'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/navigation'
import { Dashboard } from '@/components/dashboard'
import ProjectDashboard from '@/components/ProjectDashboard'
import ProjectList from '@/components/ProjectList'
import { CollectivePulse } from '@/components/collective-pulse'
import { Tribes } from '@/components/tribes'
import { Button } from '@/components/ui/button'
import { Loader2, PanelLeftClose, PanelLeftOpen, HelpCircle } from 'lucide-react'
import { View, Project, Post, Tribe } from '@/types'
// ... imports ...
import { HomeDashboard } from '@/components/HomeDashboard'
import { getPosts, getProjects, getUserProjects, createProject, deleteProject, getUserTribes, joinTribe, leaveTribe, assignProjectToTribe } from '@/lib/supabase/queries'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getDailyLockStatus } from '@/lib/daily-lock'
import { ContributionGraph } from '@/components/ContributionGraph'
import DailyCheckIn from '@/components/DailyCheckIn'


function ValleyPageInner() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentView, setCurrentView] = useState<View>('pulse')

  useEffect(() => {
    const view = searchParams.get('view') as View
    if (view === 'pulse' || view === 'valley' || view === 'tribes') {
      setCurrentView(view)
    }
  }, [searchParams])
  const [globalPosts, setGlobalPosts] = useState<Post[]>([])

  // State for data
  const [ecosystemProjects, setEcosystemProjects] = useState<Project[]>([])
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [userTribes, setUserTribes] = useState<Tribe[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState<number>(320)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const [isLocked, setIsLocked] = useState<boolean | null>(null) // null = loading

  useEffect(() => {
    if (!loading && user && profile) {
      // If user has projects but hasn't "completed" onboarding, let them skip the guide
      if (!profile.onboardingCompleted && userProjects.length === 0) {
        router.push('/onboarding')
      }
    }
  }, [user, profile, loading, router, userProjects.length])

  // Create project dialog state
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newIsPublic, setNewIsPublic] = useState(true)
  const [newTribeIds, setNewTribeIds] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  // ... useEffect for checking lock ...
  useEffect(() => {
    const checkLock = async () => {
      if (!user || !profile) return
      // Admins bypass the daily lock entirely
      if (profile.isAdmin) {
        setIsLocked(false)
        return
      }
      const { isLocked } = await getDailyLockStatus(user.id)
      setIsLocked(isLocked)
    }
    checkLock()
  }, [user, profile])

  useEffect(() => {
    const loadProjectsAndPosts = async () => {
      if (!user) return
      try {
        // Parallelize fetching to avoid waterfalls
        const [allProjs, personal, recent] = await Promise.all([
          getProjects(user.id),
          getUserProjects(user.id),
          getPosts(200)
        ])

        setEcosystemProjects(allProjs)
        setUserProjects(personal)
        setGlobalPosts(recent)
        setPosts(recent)
      } catch (e) {
        console.error('Error loading data:', e)
      }
    }

    if (user && profile) {
      loadProjectsAndPosts()
      setPosts(globalPosts)
      getUserTribes(user.id).then(ut => {
        setUserTribes(ut)
        setTribes(ut)
      })
    }
  }, [user, profile])

  const handleCreateProject = () => {
    setShowCreate(true)
  }

  const handleDeleteProject = (projectId: string) => {
    // Optimistic UI delete
    const next = userProjects.filter(p => p.id !== projectId)
    setUserProjects(next)
    // If deleting the selected project, select the first remaining (if any)
    if (selectedProjectId === projectId) {
      setSelectedProjectId(next.length ? next[0].id : null)
    }
    deleteProject(projectId).catch(() => {
      // rollback
      setUserProjects(userProjects)
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
    setCurrentView('valley')
  }

  const submitCreate = async () => {
    if (!user || !newName.trim()) return
    setCreating(true)
    const created = await createProject({
      userId: user.id,
      name: newName.trim(),
      description: newDescription || '',
      isPublic: newIsPublic,
      status: 'active',
      color: 'bg-neutral-900',
    })
    setCreating(false)
    if (created) {
      if (newTribeIds.length > 0) {
        await Promise.all(newTribeIds.map(tid => assignProjectToTribe(created.id, tid)))
      }
      setUserProjects(prev => [created, ...prev])
      setEcosystemProjects(prev => [created, ...prev])
      setShowCreate(false)
      setNewName('')
      setNewDescription('')
      setNewIsPublic(true)
      setNewTribeIds([])
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
    router.push('/tribes/new')
  }

  const handleJoinTribe = async (tribeId: string) => {
    if (!user) return
    const ok = await joinTribe(user.id, tribeId)
    if (ok) {
      setTribes(prev => prev.map(t => t.id === tribeId ? { ...t, isMember: true, memberCount: t.memberCount + 1 } : t))
      const joined = tribes.find(t => t.id === tribeId)
      if (joined) setUserTribes(prev => [...prev, { ...joined, isMember: true, userRole: 'member' }])
    }
  }

  const handleLeaveTribe = async (tribeId: string) => {
    if (!user) return
    const ok = await leaveTribe(user.id, tribeId)
    if (ok) {
      setTribes(prev => prev.map(t => t.id === tribeId ? { ...t, isMember: false, memberCount: Math.max(0, t.memberCount - 1) } : t))
      setUserTribes(prev => prev.filter(t => t.id !== tribeId))
    }
  }

  const handleEditTribe = (tribe: Tribe) => {
    router.push(`/tribes/${tribe.slug}`)
  }

  const handleViewTribe = (tribe: Tribe) => {
    router.push(`/tribes/${tribe.slug}`)
  }

  const handleUnlock = () => {
    setIsLocked(false)
  }

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      const timer = setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [loading, user, profile, router])

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
          <h1 className="text-2xl font-bold mb-2 text-white">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need to be logged in to access this page.</p>
          <p className="text-xs opacity-50">Redirecting to login...</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/auth/login')}
          >
            Go to Login Now
          </Button>
        </div>
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <CollectivePulse
            posts={posts}
            projects={ecosystemProjects}
            currentUserId={user?.id}
            onCreatePost={handleCreatePost}
            onLikePost={handleLikePost}
            onCommentPost={handleCommentPost}
            onSavePost={handleSavePost}
            onViewPost={handleViewPost}
          />
        )
      case 'valley':
        return (
          <div className="min-h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)] gap-8">
            <div
              className={cn(
                "transition-all duration-500 overflow-hidden relative hidden lg:block",
                sidebarCollapsed ? "w-12" : "w-[320px]"
              )}
            >
              <div className="sticky top-0 h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar space-y-12">
                {/* Intro Guidance */}
                {!sidebarCollapsed && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-50 flex items-center gap-2">
                      <HelpCircle className="h-3 w-3" /> Welcome to the Valley
                    </h3>
                    <p className="text-[10px] leading-relaxed text-neutral-400">
                      This is your private creative sanctum. Organize your projects into channels and blocks, and document your flow.
                    </p>
                  </div>
                )}

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
                    {/* Quick Summary Section */}
                    <div className="space-y-6 pb-6 border-b border-white/5">
                      <div className="space-y-1">
                        <h3 className="text-xs uppercase tracking-[0.2em] opacity-40 italic">Creator Stats</h3>
                        <p className="text-2xl font-bold tracking-tighter">
                          {userProjects.length} <span className="text-[10px] uppercase tracking-widest opacity-40 font-normal">Active Projects</span>
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xs uppercase tracking-[0.2em] opacity-40 italic">Activity Tracker</h3>
                        {user && <ContributionGraph userId={user.id} />}
                      </div>
                    </div>

                    <ProjectList
                      projects={userProjects}
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
                  const p = userProjects.find(proj => proj.id === e.target.value)
                  if (p) handleViewProject(p)
                }}
              >
                <option value="" disabled>SELECT PROJECT</option>
                {userProjects.map(p => (
                  <option key={p.id} value={p.id} className="bg-black text-white">{p.name}</option>
                ))}
              </select>
            </div>

            <div className="min-h-[50vh]">
              {selectedProjectId && userProjects.find(p => p.id === selectedProjectId) ? (
                <ProjectDashboard
                  project={userProjects.find(p => p.id === selectedProjectId)}
                  onProjectUpdated={(p) => {
                    setUserProjects(prev => prev.map(x => x.id === p.id ? p : x))
                    setEcosystemProjects(prev => prev.map(x => x.id === p.id ? p : x))
                  }}
                />
              ) : (
                <HomeDashboard
                  profile={profile}
                  projects={userProjects}
                  recentPosts={globalPosts}
                  onSelectProject={handleSelectProject}
                  onCreateProject={handleCreateProject}
                  onExploreForest={() => setCurrentView('pulse')}
                />
              )}
            </div>

          </div>
        )
      case 'pulse':
        return (
          <CollectivePulse
            posts={posts}
            projects={ecosystemProjects}
            userTribes={userTribes}
            currentUserId={user?.id}
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
      <Navigation currentView={currentView} onViewChange={setCurrentView} onCreate={handleCreateProject} />
      <main className={cn(
        "w-full transition-all duration-300",
        currentView === 'pulse' ? "px-0 py-0 h-[calc(100vh-5rem)]" : "px-4 md:px-8 py-8"
      )}>
        {renderCurrentView()}
      </main>
      {isLocked && <DailyCheckIn onUnlock={handleUnlock} key={user?.id} />}

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
            {userTribes.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest opacity-50">Assign to Tribes</label>
                <div className="space-y-2">
                  {userTribes.map(tribe => (
                    <label key={tribe.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={newTribeIds.includes(tribe.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTribeIds(prev => [...prev, tribe.id])
                          } else {
                            setNewTribeIds(prev => prev.filter(id => id !== tribe.id))
                          }
                        }}
                        className="w-4 h-4 rounded-none border-neutral-300 text-black focus:ring-black"
                      />
                      <span className="text-xs uppercase tracking-widest group-hover:opacity-70 transition-opacity">
                        {tribe.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
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
    </div>
  )
}

export default function ValleyPage() {
  return (
    <Suspense>
      <ValleyPageInner />
    </Suspense>
  )
}
