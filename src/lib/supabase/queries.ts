import { createClient } from './client'
import { Profile, Project, Tribe, Post, Block, Channel, PostType, BlockType } from '@/types'

const supabase = createClient()

// Profile queries
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching profile:', error?.message || error)
    return null
  }

  return (data as unknown as Profile) ?? null
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error) {
    console.error('Error fetching profile by username:', error?.message || error)
    return null
  }

  return (data as unknown as Profile) ?? null
}

export async function createProfile(profile: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile as unknown as Record<string, unknown>)
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error?.message || error)
    return null
  }

  return data as unknown as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  // Map camelCase fields to snake_case DB columns
  const payload: Record<string, unknown> = {}
  if (updates.username !== undefined) payload.username = updates.username
  const rawUpdates = updates as unknown as Record<string, unknown>
  if (Object.prototype.hasOwnProperty.call(rawUpdates, 'full_name')) {
    payload.full_name = rawUpdates.full_name
  }
  if (updates.fullName !== undefined) payload.full_name = updates.fullName
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl
  if (updates.bio !== undefined) payload.bio = updates.bio
  if (updates.location !== undefined) payload.location = updates.location
  if (updates.website !== undefined) payload.website = updates.website
  if (updates.skills !== undefined) payload.skills = updates.skills
  if (updates.creativePhilosophy !== undefined) payload.creative_philosophy = updates.creativePhilosophy
  if (Object.prototype.hasOwnProperty.call(rawUpdates, 'looking_for_collaboration')) {
    payload.looking_for_collaboration = rawUpdates.looking_for_collaboration
  }
  if (updates.lookingForCollaboration !== undefined) payload.looking_for_collaboration = updates.lookingForCollaboration
  if (updates.portfolioUrl !== undefined) payload.portfolio_url = updates.portfolioUrl

  console.log('Updating profile payload:', JSON.stringify(payload, null, 2))

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single()

  if (error) {
    console.error('Error updating profile:', JSON.stringify(error, null, 2))
    return null
  }

  return data as Profile
}

// Helpers to map between DB snake_case and app camelCase
type DbProject = {
  id: string
  user_id: string
  name: string
  description?: string | null
  color?: string | null
  status: Project['status']
  is_public: boolean
  tags?: string[] | null
  cover_image_url?: string | null
  tribe_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

function mapProjectFromDb(row: DbProject): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? '',
    color: row.color ?? 'bg-neutral-900',
    status: row.status,
    isPublic: row.is_public,
    tags: row.tags ?? [],
    coverImageUrl: row.cover_image_url ?? undefined,
    tribeId: row.tribe_id ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  }
}

function mapProjectToDb(p: Partial<Project>): Partial<DbProject> {
  return {
    ...(p.id ? { id: p.id } : {}),
    ...(p.userId ? { user_id: p.userId } : {}),
    ...(p.name !== undefined ? { name: p.name } : {}),
    ...(p.description !== undefined ? { description: p.description } : {}),
    ...(p.color !== undefined ? { color: p.color } : {}),
    ...(p.status !== undefined ? { status: p.status } : {}),
    ...(p.isPublic !== undefined ? { is_public: p.isPublic } : {}),
    ...(p.tags !== undefined ? { tags: p.tags } : {}),
    ...(p.coverImageUrl !== undefined ? { cover_image_url: p.coverImageUrl } : {}),
    ...(p.tribeId !== undefined ? { tribe_id: p.tribeId } : {}),
  }
}

// Project queries
export async function getProjects(userId?: string): Promise<Project[]> {
  // Keep selection simple to avoid RLS issues on joined tables
  const base = supabase.from('projects').select('*').order('created_at', { ascending: false })

  const { data, error } = userId
    ? await base.or(`user_id.eq.${userId},is_public.eq.true`)
    : await base.eq('is_public', true)

  if (error) {
    console.error('Error fetching projects:', error?.message || error)
    return []
  }

  return ((data || []) as DbProject[]).map(mapProjectFromDb)
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user projects:', error)
    return []
  }

  return ((data || []) as DbProject[]).map(mapProjectFromDb)
}

export async function createProject(project: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert(mapProjectToDb(project))
    .select('*')
    .single()

  if (error) {
    console.error('Error creating project:', (error as unknown as { message?: string })?.message || error)
    return null
  }

  return mapProjectFromDb(data)
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(mapProjectToDb(updates))
    .eq('id', projectId)
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('Error updating project:', JSON.stringify(error, null, 2))
    return null
  }

  if (!data) {
    console.error('Error updating project: Project not found or permission denied')
    return null
  }

  return mapProjectFromDb(data)
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Error deleting project:', error)
    return false
  }

  return true
}

// Tribe queries
export async function getTribes(): Promise<Tribe[]> {
  const { data, error } = await supabase
    .from('tribes')
    .select(`
      *,
      creator:profiles(*),
      tribe_memberships!inner(*)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tribes:', error)
    return []
  }

  return (data || []).map(tribe => ({
    ...tribe,
    isMember: tribe.tribe_memberships?.length > 0,
    userRole: tribe.tribe_memberships?.[0]?.role,
  })) as Tribe[]
}

export async function getUserTribes(userId: string): Promise<Tribe[]> {
  const { data, error } = await supabase
    .from('tribe_memberships')
    .select(`
      *,
      tribe:tribes(*, creator:profiles(*))
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user tribes:', error)
    return []
  }

  return (data || []).map(membership => ({
    ...membership.tribe,
    isMember: true,
    userRole: membership.role,
  })) as Tribe[]
}

// Helpers to map between DB snake_case and app camelCase for Tribes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DbTribe = {
  id: string
  name: string
  slug: string
  description: string
  cover_image_url?: string | null
  icon_url?: string | null
  creator_id: string
  is_public: boolean
  member_count: number
  post_count: number
  tags?: string[] | null
  rules?: string[] | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

function mapTribeFromDb(row: DbTribe): Tribe {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    coverImageUrl: row.cover_image_url || undefined,
    iconUrl: row.icon_url || undefined,
    creatorId: row.creator_id,
    isPublic: row.is_public,
    memberCount: row.member_count,
    postCount: row.post_count,
    tags: row.tags || undefined,
    rules: row.rules || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    // Relations to be populated separately or casted
  }
}

function mapTribeToDb(t: Partial<Tribe>): Partial<DbTribe> {
  const db: Partial<DbTribe> = {}
  if (t.id) db.id = t.id
  if (t.name) db.name = t.name
  if (t.slug) db.slug = t.slug
  if (t.description) db.description = t.description
  if (t.coverImageUrl) db.cover_image_url = t.coverImageUrl
  if (t.iconUrl) db.icon_url = t.iconUrl
  if (t.creatorId) db.creator_id = t.creatorId
  if (t.isPublic !== undefined) db.is_public = t.isPublic
  if (t.tags) db.tags = t.tags
  if (t.rules) db.rules = t.rules
  return db
}

export async function createTribe(tribe: Partial<Tribe>): Promise<Tribe | null> {
  const { data, error } = await supabase
    .from('tribes')
    .insert(mapTribeToDb(tribe))
    .select(`
      *,
      creator:profiles(*)
    `)
    .single()

  if (error) {
    console.error('Error creating tribe:', error)
    return null
  }

  const tribeData = data as DbTribe & { creator: Profile }
  return {
    ...mapTribeFromDb(tribeData),
    creator: tribeData.creator
  } as Tribe
}

export async function joinTribe(userId: string, tribeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tribe_memberships')
    .insert({
      user_id: userId,
      tribe_id: tribeId,
      role: 'member'
    })

  if (error) {
    console.error('Error joining tribe:', error)
    return false
  }

  return true
}

export async function leaveTribe(userId: string, tribeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tribe_memberships')
    .delete()
    .eq('user_id', userId)
    .eq('tribe_id', tribeId)

  if (error) {
    console.error('Error leaving tribe:', error)
    return false
  }

  return true
}

// Post queries
// Helpers to map between DB snake_case and app camelCase for Posts
type DbPost = {
  id: string
  user_id: string
  project_id?: string | null
  tribe_id?: string | null
  type: PostType
  title?: string | null
  content: string
  media_url?: string | null
  media_type?: string | null
  thumbnail_url?: string | null
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at: string
  user?: Profile
  project?: Project
  tribe?: Tribe
  [key: string]: unknown
}

function mapPostFromDb(row: DbPost): Post {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id || undefined,
    tribeId: row.tribe_id || undefined,
    type: row.type,
    title: row.title || undefined,
    content: row.content,
    mediaUrl: row.media_url || undefined,
    mediaType: row.media_type || undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
    isFeatured: row.is_featured,
    viewCount: row.view_count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    user: row.user,
    project: row.project,
    tribe: row.tribe,
    likeCount: 0, // Will be populated separately
    commentCount: 0, // Will be populated separately
    isLiked: false,
    isSaved: false,
  }
}

export async function getPosts(limit = 20, offset = 0, projectId?: string, userId?: string): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select(`
      *,
      user:profiles(*),
      project:projects(*),
      tribe:tribes(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  // Get like and comment counts for each post
  const postsWithCounts = await Promise.all(
    (data || []).map(async (row) => {
      const post = mapPostFromDb(row as DbPost)
      const [likeCount, commentCount] = await Promise.all([
        getPostLikeCount(post.id),
        getPostCommentCount(post.id)
      ])

      return {
        ...post,
        likeCount,
        commentCount,
      }
    })
  )

  return postsWithCounts
}

export async function createPost(post: Partial<Post>): Promise<Post | null> {
  // Map camelCase to snake_case
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbPost: any = { ...post }
  if (post.userId) { dbPost.user_id = post.userId; delete dbPost.userId }
  if (post.projectId) { dbPost.project_id = post.projectId; delete dbPost.projectId }
  if (post.tribeId) { dbPost.tribe_id = post.tribeId; delete dbPost.tribeId }
  if (post.mediaUrl) { dbPost.media_url = post.mediaUrl; delete dbPost.mediaUrl }
  if (post.mediaType) { dbPost.media_type = post.mediaType; delete dbPost.mediaType }
  if (post.thumbnailUrl) { dbPost.thumbnail_url = post.thumbnailUrl; delete dbPost.thumbnailUrl }
  if (post.isFeatured !== undefined) { dbPost.is_featured = post.isFeatured; delete dbPost.isFeatured }

  // Remove view-only fields
  delete dbPost.user
  delete dbPost.project
  delete dbPost.tribe
  delete dbPost.likeCount
  delete dbPost.commentCount
  delete dbPost.isLiked
  delete dbPost.isSaved

  const { data, error } = await supabase
    .from('posts')
    .insert(dbPost)
    .select(`
      *,
      user:profiles(*),
      project:projects(*),
      tribe:tribes(*)
    `)
    .single()

  if (error) {
    console.error('Error creating post:', JSON.stringify(error, null, 2))
    return null
  }

  return mapPostFromDb(data as DbPost)
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<Post | null> {
  // Map camelCase to snake_case
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbPost: any = { ...updates }
  if (updates.userId) { dbPost.user_id = updates.userId; delete dbPost.userId }
  if (updates.projectId) { dbPost.project_id = updates.projectId; delete dbPost.projectId }
  if (updates.tribeId) { dbPost.tribe_id = updates.tribeId; delete dbPost.tribeId }
  if (updates.mediaUrl) { dbPost.media_url = updates.mediaUrl; delete dbPost.mediaUrl }
  if (updates.mediaType) { dbPost.media_type = updates.mediaType; delete dbPost.mediaType }
  if (updates.thumbnailUrl) { dbPost.thumbnail_url = updates.thumbnailUrl; delete dbPost.thumbnailUrl }
  if (updates.isFeatured !== undefined) { dbPost.is_featured = updates.isFeatured; delete dbPost.isFeatured }

  // Remove view-only fields
  delete dbPost.id
  delete dbPost.user
  delete dbPost.project
  delete dbPost.tribe
  delete dbPost.likeCount
  delete dbPost.commentCount
  delete dbPost.isLiked
  delete dbPost.isSaved
  delete dbPost.createdAt
  delete dbPost.updatedAt

  dbPost.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('posts')
    .update(dbPost)
    .eq('id', postId)
    .select(`
      *,
      user:profiles(*),
      project:projects(*),
      tribe:tribes(*)
    `)
    .single()

  if (error) {
    console.error('Error updating post:', JSON.stringify(error, null, 2))
    return null
  }

  return mapPostFromDb(data as DbPost)
}

export async function getPostLikeCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  if (error) {
    console.error('Error fetching like count:', error)
    return 0
  }

  return count || 0
}

export async function getPostCommentCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  if (error) {
    console.error('Error fetching comment count:', error)
    return 0
  }

  return count || 0
}

export async function likePost(userId: string, postId: string): Promise<boolean> {
  const { error } = await supabase
    .from('likes')
    .insert({
      user_id: userId,
      post_id: postId,
      type: 'like'
    })

  if (error) {
    console.error('Error liking post:', error)
    return false
  }

  return true
}

export async function unlikePost(userId: string, postId: string): Promise<boolean> {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId)

  if (error) {
    console.error('Error unliking post:', error)
    return false
  }

  return true
}

// Channel and Block queries
// Helpers to map between DB snake_case and app camelCase for Channels
type DbChannel = {
  id: string
  project_id: string
  name: string
  description?: string | null
  color: string
  order_index: number
  created_at: string
  updated_at: string
  [key: string]: unknown
}

function mapChannelFromDb(row: DbChannel): Channel {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description || undefined,
    color: row.color,
    orderIndex: row.order_index,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    blockCount: (row.blocks as unknown as unknown[])?.length || 0
  }
}

function mapChannelToDb(c: Partial<Channel>): Partial<DbChannel> {
  const db: Partial<DbChannel> = {}
  if (c.id) db.id = c.id
  if (c.projectId) db.project_id = c.projectId
  if (c.name) db.name = c.name
  if (c.description) db.description = c.description
  if (c.color) db.color = c.color
  if (c.orderIndex !== undefined) db.order_index = c.orderIndex
  return db
}

export async function getChannels(projectId: string): Promise<Channel[]> {
  const { data, error } = await supabase
    .from('channels')
    .select(`
      *,
      blocks(*)
    `)
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching channels:', error)
    return []
  }

  return (data || []).map(row => mapChannelFromDb(row as DbChannel))
}

export async function createChannel(channel: Partial<Channel>): Promise<Channel | null> {
  const { data, error } = await supabase
    .from('channels')
    .insert(mapChannelToDb(channel)) // Use the mapper!
    .select(`
      *,
      blocks(*)
    `)
    .single()

  if (error) {
    console.error('Error creating channel:', error)
    return null
  }

  return mapChannelFromDb(data as DbChannel)
}

export async function deleteChannel(channelId: string): Promise<boolean> {
  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('id', channelId)

  if (error) {
    console.error('Error deleting channel:', error)
    return false
  }

  return true
}

// Helpers to map between DB snake_case and app camelCase for Blocks
type DbBlock = {
  id: string
  channel_id: string
  type: BlockType
  title?: string | null
  content: string
  description?: string | null
  metadata?: Record<string, unknown> | null
  order_index: number
  created_at: string
  updated_at: string
  [key: string]: unknown
}

function mapBlockFromDb(row: DbBlock): Block {
  return {
    id: row.id,
    channelId: row.channel_id,
    type: row.type,
    title: row.title || undefined,
    content: row.content,
    description: row.description || undefined,
    metadata: (row.metadata as Record<string, unknown>) || undefined,
    orderIndex: row.order_index,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function mapBlockToDb(b: Partial<Block>): Partial<DbBlock> {
  const db: Partial<DbBlock> = {}
  if (b.id) db.id = b.id
  if (b.channelId) db.channel_id = b.channelId
  if (b.type) db.type = b.type
  if (b.title) db.title = b.title
  if (b.content) db.content = b.content
  if (b.description) db.description = b.description
  if (b.metadata) db.metadata = b.metadata
  if (b.orderIndex !== undefined) db.order_index = b.orderIndex
  return db
}

export async function getBlocks(channelId: string): Promise<Block[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('channel_id', channelId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching blocks:', error)
    return []
  }

  return ((data || []) as unknown as DbBlock[]).map(mapBlockFromDb)
}

export async function createBlock(block: Partial<Block>): Promise<Block | null> {
  const { data, error } = await supabase
    .from('blocks')
    .insert(mapBlockToDb(block))
    .select()
    .single()

  if (error) {
    console.error('Error creating block:', error)
    return null
  }

  return mapBlockFromDb(data as DbBlock)
}

// Search functions
export async function searchProjects(query: string): Promise<Project[]> {
  const { data, error } = await supabase
    .rpc('search_projects', { search_term: query })

  if (error) {
    console.error('Error searching projects:', error)
    return []
  }

  return data as Project[]
}

export async function searchTribes(query: string): Promise<Tribe[]> {
  const { data, error } = await supabase
    .rpc('search_tribes', { search_term: query })

  if (error) {
    console.error('Error searching tribes:', error)
    return []
  }

  return data as Tribe[]
}

// Storage helpers
// Note: These are legacy functions. New code should use the storage utilities from @/lib/storage
// Keeping these for backward compatibility

export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)

  if (error) {
    console.error('Error uploading file:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Error deleting file:', error)
    return false
  }

  return true
}

// Re-export storage utilities for convenience
// Note: uploadFile and deleteFile are already defined above, so we export the new ones with different names
export {
  uploadFile as uploadFileWithValidation,
  uploadFiles,
  deleteFile as deleteStorageFile,
  deleteFiles,
  getPublicUrl,
  fileExists,
  generateFilePath,
  validateFile,
  formatFileSize,
  formatDuration,
  getFileType,
  FILE_TYPES,
  type FileMetadata,
  type FileValidationResult,
  type UploadOptions,
  type UploadResult
} from '@/lib/storage'

