'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Eye,
  Calendar,
  Target,
  Award,
  ArrowRight,
  Plus,
  Sparkles,
  Mountain
} from 'lucide-react'
import { Project, Post, Tribe, Profile } from '@/types'
import { cn } from '@/lib/utils'

interface DashboardProps {
  profile: Profile
  projects: Project[]
  posts: Post[]
  tribes: Tribe[]
  onCreateProject: () => void
  onCreatePost: () => void
  onCreateTribe: () => void
  onViewProject: (project: Project) => void
  onViewPost: (post: Post) => void
  onViewTribe: (tribe: Tribe) => void
}

export function Dashboard({ 
  profile, 
  projects, 
  posts, 
  tribes, 
  onCreateProject, 
  onCreatePost, 
  onCreateTribe, 
  onViewProject, 
  onViewPost, 
  onViewTribe 
}: DashboardProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week')

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const myTribes = tribes.filter(t => t.isMember)
  const recentPosts = posts.slice(0, 5)
  const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0)
  const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatarUrl} />
            <AvatarFallback className="text-lg">
              {profile.fullName?.charAt(0) || profile.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {profile.fullName || profile.username || 'Creator'}!
            </h1>
            <p className="text-muted-foreground">
              Ready to continue your creative journey?
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={timeframe === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('week')}
          >
            Week
          </Button>
          <Button
            variant={timeframe === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('month')}
          >
            Month
          </Button>
          <Button
            variant={timeframe === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('all')}
          >
            All Time
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={onCreateProject}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Mountain className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">Start New Project</h3>
                <p className="text-sm text-muted-foreground">Organize your ideas and build something amazing</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={onCreatePost}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">Share Update</h3>
                <p className="text-sm text-muted-foreground">Document your progress with the community</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={onCreateTribe}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">Create Tribe</h3>
                <p className="text-sm text-muted-foreground">Build a community around shared interests</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Projects</span>
            </div>
            <div className="text-2xl font-bold mt-1">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeProjects.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Posts</span>
            </div>
            <div className="text-2xl font-bold mt-1">{posts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalLikes} total likes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Tribes</span>
            </div>
            <div className="text-2xl font-bold mt-1">{myTribes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Member of {myTribes.length} communities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Views</span>
            </div>
            <div className="text-2xl font-bold mt-1">{totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total profile views
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest updates and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={onCreatePost}>
                    Share your first update
                  </Button>
                </div>
              ) : (
                recentPosts.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onViewPost(post)}>
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {post.title || 'Shared an update'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(post.createdAt)} • {post.likeCount || 0} likes
                      </p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Projects
            </CardTitle>
            <CardDescription>Projects you&apos;re currently working on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Mountain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active projects</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={onCreateProject}>
                    Start your first project
                  </Button>
                </div>
              ) : (
                activeProjects.map((project) => (
                  <div key={project.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onViewProject(project)}>
                    <div 
                      className={cn(
                        "w-3 h-3 rounded-full flex-shrink-0",
                        project.color || 'bg-neutral-900'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.blockCount || 0} resources • Updated {formatTimeAgo(project.updatedAt)}
                      </p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Tribes */}
      {myTribes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Tribes
            </CardTitle>
            <CardDescription>Communities you&apos;re part of</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myTribes.map((tribe) => (
                <div key={tribe.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onViewTribe(tribe)}>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{tribe.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tribe.memberCount} members • {tribe.postCount} posts
                    </p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Your creative milestones and accomplishments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">First Project</p>
                <p className="text-xs text-muted-foreground">Created your first project</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Community Contributor</p>
                <p className="text-xs text-muted-foreground">Shared your first post</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Goal Setter</p>
                <p className="text-xs text-muted-foreground">Completed a project</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Community Builder</p>
                <p className="text-xs text-muted-foreground">Joined your first tribe</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

