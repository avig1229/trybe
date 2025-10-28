// Core Types
export type BlockType = 'image' | 'link' | 'text' | 'video' | 'audio' | 'file'
export type ProjectStatus = 'active' | 'planning' | 'completed' | 'paused'
export type PostType = 'progress' | 'question' | 'showcase' | 'collaboration_request'
export type TribeRole = 'member' | 'moderator' | 'admin'
export type LikeType = 'like' | 'love' | 'support' | 'inspire'
export type NotificationType = 'like' | 'comment' | 'collaboration_request' | 'tribe_invite' | 'project_update'
export type CollaborationStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'

// User Profile
export interface Profile {
  id: string
  username?: string
  fullName?: string
  avatarUrl?: string
  bio?: string
  location?: string
  website?: string
  skills?: string[]
  creativePhilosophy?: string
  lookingForCollaboration: boolean
  portfolioUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Tribe
export interface Tribe {
  id: string
  name: string
  slug: string
  description: string
  coverImageUrl?: string
  iconUrl?: string
  creatorId: string
  isPublic: boolean
  memberCount: number
  postCount: number
  tags?: string[]
  rules?: string[]
  createdAt: Date
  updatedAt: Date
  creator?: Profile
  isMember?: boolean
  userRole?: TribeRole
}

// Tribe Membership
export interface TribeMembership {
  id: string
  tribeId: string
  userId: string
  role: TribeRole
  joinedAt: Date
  tribe?: Tribe
  user?: Profile
}

// Project
export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  status: ProjectStatus
  isPublic: boolean
  tags?: string[]
  coverImageUrl?: string
  tribeId?: string
  createdAt: Date
  updatedAt: Date
  user?: Profile
  tribe?: Tribe
  channelCount?: number
  blockCount?: number
  postCount?: number
}

// Channel (for organizing blocks within projects)
export interface Channel {
  id: string
  projectId: string
  name: string
  description?: string
  color: string
  orderIndex: number
  createdAt: Date
  updatedAt: Date
  project?: Project
  blockCount?: number
}

// Block (resources/content blocks)
export interface Block {
  id: string
  channelId: string
  type: BlockType
  title?: string
  content: string
  description?: string
  metadata?: Record<string, unknown>
  orderIndex: number
  createdAt: Date
  updatedAt: Date
  channel?: Channel
}

// Post (for Collective Pulse)
export interface Post {
  id: string
  userId: string
  projectId?: string
  tribeId?: string
  type: PostType
  title?: string
  content: string
  mediaUrl?: string
  mediaType?: string
  thumbnailUrl?: string
  isFeatured: boolean
  viewCount: number
  createdAt: Date
  updatedAt: Date
  user?: Profile
  project?: Project
  tribe?: Tribe
  likeCount?: number
  commentCount?: number
  isLiked?: boolean
  isSaved?: boolean
}

// Like
export interface Like {
  id: string
  userId: string
  postId: string
  type: LikeType
  createdAt: Date
  user?: Profile
  post?: Post
}

// Comment
export interface Comment {
  id: string
  userId: string
  postId: string
  parentCommentId?: string
  content: string
  createdAt: Date
  updatedAt: Date
  user?: Profile
  post?: Post
  replies?: Comment[]
  replyCount?: number
}

// Collaboration Request
export interface CollaborationRequest {
  id: string
  requesterId: string
  projectId: string
  message: string
  skillsNeeded?: string[]
  status: CollaborationStatus
  createdAt: Date
  updatedAt: Date
  requester?: Profile
  project?: Project
}

// Notification
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: Date
}

// Follow
export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
  follower?: Profile
  following?: Profile
}

// Project Save
export interface ProjectSave {
  id: string
  userId: string
  projectId: string
  createdAt: Date
  project?: Project
}

// UI State Types
export type View = 'dashboard' | 'valley' | 'pulse' | 'tribes'
export type ProjectView = 'grid' | 'list' | 'timeline'
export type BlockView = 'grid' | 'list' | 'masonry'

// API Response Types
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface SearchResult<T> {
  items: T[]
  total: number
  query: string
  filters?: Record<string, unknown>
}

// Form Types
export interface CreateProjectForm {
  name: string
  description?: string
  color: string
  isPublic: boolean
  tags?: string[]
  tribeId?: string
}

export interface CreateTribeForm {
  name: string
  slug: string
  description: string
  isPublic: boolean
  tags?: string[]
  rules?: string[]
}

export interface CreatePostForm {
  type: PostType
  title?: string
  content: string
  projectId?: string
  tribeId?: string
  mediaFile?: File
}

export interface CreateBlockForm {
  type: BlockType
  title?: string
  content: string
  description?: string
  channelId: string
  file?: File
}

// Filter and Sort Types
export interface ProjectFilters {
  status?: ProjectStatus[]
  tags?: string[]
  isPublic?: boolean
  tribeId?: string
  userId?: string
}

export interface PostFilters {
  type?: PostType[]
  tribeId?: string
  projectId?: string
  userId?: string
  isFeatured?: boolean
}

export interface TribeFilters {
  isPublic?: boolean
  tags?: string[]
  creatorId?: string
}

export type SortOption = 'newest' | 'oldest' | 'popular' | 'name' | 'updated'
