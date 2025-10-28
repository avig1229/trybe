'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Filter,
  Search,
  Users,
  Calendar,
  Eye,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Post, PostType, Project } from '@/types'
import { cn } from '@/lib/utils'

interface CollectivePulseProps {
  posts: Post[]
  projects: Project[]
  onCreatePost: () => void
  onLikePost: (postId: string) => void
  onCommentPost: (postId: string) => void
  onSavePost: (postId: string) => void
  onViewPost: (post: Post) => void
}

export function CollectivePulse({ 
  posts, 
  projects, 
  onCreatePost, 
  onLikePost, 
  onCommentPost, 
  onSavePost, 
  onViewPost 
}: CollectivePulseProps) {
  const [typeFilter, setTypeFilter] = useState<PostType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = posts.filter(post => {
    const matchesType = typeFilter === 'all' || post.type === typeFilter
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.project?.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const getPostTypeColor = (type: PostType) => {
    switch (type) {
      case 'progress': return 'bg-blue-100 text-blue-800'
      case 'question': return 'bg-yellow-100 text-yellow-800'
      case 'showcase': return 'bg-green-100 text-green-800'
      case 'collaboration_request': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPostTypeIcon = (type: PostType) => {
    switch (type) {
      case 'progress': return TrendingUp
      case 'question': return MessageCircle
      case 'showcase': return Sparkles
      case 'collaboration_request': return Users
      default: return Heart
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const PostCard = ({ post }: { post: Post }) => {
    const TypeIcon = getPostTypeIcon(post.type)
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.user?.avatarUrl} />
                <AvatarFallback>
                  {post.user?.fullName?.charAt(0) || post.user?.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {post.user?.fullName || post.user?.username || 'Anonymous'}
                  </h3>
                  <Badge variant="outline" className={getPostTypeColor(post.type)}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {post.type.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatTimeAgo(post.createdAt)}</span>
                  {post.project && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span>in</span>
                        <span className="font-medium">{post.project.name}</span>
                      </span>
                    </>
                  )}
                  {post.tribe && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{post.tribe.name}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {post.isFeatured && (
                <Badge variant="secondary" className="text-xs">
                  Featured
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {post.title && (
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {post.title}
            </CardTitle>
          )}
          
          <CardDescription className="line-clamp-3">
            {post.content}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Media Preview */}
          {post.mediaUrl && (
            <div className="mb-4 rounded-lg overflow-hidden bg-muted">
              {post.mediaType?.startsWith('image/') ? (
                <img 
                  src={post.mediaUrl} 
                  alt={post.title || 'Post media'} 
                  className="w-full h-48 object-cover"
                />
              ) : post.mediaType?.startsWith('video/') ? (
                <div className="w-full h-48 bg-black flex items-center justify-center">
                  <div className="text-white">Video Preview</div>
                </div>
              ) : (
                <div className="w-full h-24 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Media File</span>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.viewCount}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {post.likeCount || 0}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {post.commentCount || 0}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLikePost(post.id)}
                className={cn(
                  "gap-1",
                  post.isLiked && "text-red-500"
                )}
              >
                <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                {post.likeCount || 0}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onCommentPost(post.id)}
                className="gap-1"
              >
                <MessageCircle className="h-4 w-4" />
                Comment
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onSavePost(post.id)}
                className={cn(
                  "gap-1",
                  post.isSaved && "text-blue-500"
                )}
              >
                <Bookmark className={cn("h-4 w-4", post.isSaved && "fill-current")} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Collective Pulse</h1>
          <p className="text-muted-foreground">
            Share your creative journey and discover inspiring work from the community
          </p>
        </div>
        <Button onClick={onCreatePost} className="gap-2">
          <Plus className="h-4 w-4" />
          Share Update
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-input rounded-md">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTypeFilter('all')}
              className="rounded-none rounded-l-md"
            >
              All
            </Button>
            {(['progress', 'question', 'showcase', 'collaboration_request'] as const).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTypeFilter(type)}
                className="rounded-none capitalize"
              >
                {type.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      {posts.filter(p => p.isFeatured).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Featured Posts
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {posts.filter(p => p.isFeatured).slice(0, 2).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Updates</h2>
        
        {filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No posts found</CardTitle>
              <CardDescription className="mb-4">
                {searchQuery || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to share an update with the community'
                }
              </CardDescription>
              {!searchQuery && typeFilter === 'all' && (
                <Button onClick={onCreatePost} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Share Your First Update
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Progress Updates</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {posts.filter(p => p.type === 'progress').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Showcases</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {posts.filter(p => p.type === 'showcase').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Questions</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {posts.filter(p => p.type === 'question').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Collaborations</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {posts.filter(p => p.type === 'collaboration_request').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

