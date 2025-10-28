'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Plus, 
  FolderOpen, 
  Grid3X3, 
  List, 
  Filter,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Calendar,
  Tag,
  ArrowRight
} from 'lucide-react'
import { Project, ProjectStatus, ProjectView } from '@/types'
import { cn } from '@/lib/utils'

interface ProjectValleyProps {
  projects: Project[]
  onCreateProject: () => void
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onViewProject: (project: Project) => void
  loading?: boolean
  error?: string
}

export function ProjectValley({ 
  projects, 
  onCreateProject, 
  onEditProject, 
  onDeleteProject, 
  onViewProject,
  loading = false,
  error = ''
}: ProjectValleyProps) {
  const [viewMode, setViewMode] = useState<ProjectView>('grid')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                "w-3 h-3 rounded-full",
                project.color || 'bg-neutral-900'
              )}
            />
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                {!project.isPublic && (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onViewProject(project)
              }}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
                  onDeleteProject(project.id)
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {project.description && (
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Grid3X3 className="h-3 w-3" />
              {project.blockCount || 0}
            </div>
            <div className="flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              {project.channelCount || 0}
            </div>
            {project.tribe && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {project.tribe.name}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onViewProject(project)}
        >
          Open Project
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  )

  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="flex items-center justify-between">
          <div className="h-3 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-20" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Valley</h1>
          <p className="text-muted-foreground">
            Your creative workspace for organizing ideas and building projects
          </p>
        </div>
        <Button onClick={onCreateProject} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-input rounded-md">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="rounded-none rounded-l-md"
            >
              All
            </Button>
            {(['active', 'planning', 'completed', 'paused'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="rounded-none capitalize"
              >
                {status}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1 border border-input rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none rounded-l-md"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none rounded-r-md"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {loading ? (
        <div className={cn(
          "gap-6",
          viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
        )}>
          {Array.from({ length: viewMode === 'grid' ? 6 : 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No projects found</CardTitle>
            <CardDescription className="mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started with organizing your creative work'
              }
            </CardDescription>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={onCreateProject} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "gap-6",
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "space-y-4"
        )}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {projects.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-sm text-muted-foreground">Planning</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {projects.filter(p => p.status === 'planning').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {projects.filter(p => p.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-sm text-muted-foreground">Public</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {projects.filter(p => p.isPublic).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

