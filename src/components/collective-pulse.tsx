'use client'

import { useState } from 'react'
import { Post, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Link as LinkIcon,
  Smile
} from 'lucide-react'
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
  const [newPostContent, setNewPostContent] = useState('')

  const getPostTypeIcon = (type: Post['type']) => {
    switch (type) {
      case 'progress': return '🚀'
      case 'question': return '❓'
      case 'showcase': return '✨'
      case 'collaboration_request': return '🤝'
      default: return '📝'
    }
  }

  const getPostTypeLabel = (type: Post['type']) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collective Pulse</h1>
          <p className="text-muted-foreground">See what the community is building</p>
        </div>
      </div>

      {/* Create Post */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar>
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="Share your progress, ask a question, or showcase your work..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <LinkIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                <Button onClick={onCreatePost} disabled={!newPostContent.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewPost(post)}>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <Avatar>
                <AvatarImage src={post.user?.avatarUrl} />
                <AvatarFallback>{post.user?.fullName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{post.user?.fullName || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()} • {getPostTypeIcon(post.type)} {getPostTypeLabel(post.type)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {post.title && (
                <h3 className="text-xl font-semibold">{post.title}</h3>
              )}
              <p className="whitespace-pre-wrap">{post.content}</p>

              {post.mediaUrl && (
                <div className="rounded-md overflow-hidden bg-muted aspect-video flex items-center justify-center">
                  {/* Placeholder for media */}
                  <span className="text-muted-foreground">Media Content</span>
                </div>
              )}

              {/* Tags/Context */}
              <div className="flex flex-wrap gap-2">
                {post.project && (
                  <Badge variant="outline" className="bg-primary/5">
                    Project: {post.project.name}
                  </Badge>
                )}
                {post.tribe && (
                  <Badge variant="outline" className="bg-secondary/50">
                    Tribe: {post.tribe.name}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-2", post.isLiked && "text-red-500")}
                  onClick={(e) => {
                    e.stopPropagation()
                    onLikePost(post.id)
                  }}
                >
                  <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                  {post.likeCount || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCommentPost(post.id)
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  {post.commentCount || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSavePost(post.id)
                  }}
                >
                  <Bookmark className={cn("h-4 w-4", post.isSaved && "fill-current")} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Share logic
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
