import { createClient } from './client'
import { Profile, Project, Tribe, Post, Block, Channel, PostType, BlockType, TribeMembership, TribeRole, TribeUnlockStatus, TribeStatus } from '@/types'

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

  return (data ? mapProfileFromDb(data) : null)
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

  return (data ? mapProfileFromDb(data) : null)
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

  return mapProfileFromDb(data)
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
  if (updates.onboardingCompleted !== undefined) payload.onboarding_completed = updates.onboardingCompleted
  if (updates.defaultTreeColor !== undefined) payload.default_tree_color = updates.defaultTreeColor
  if (updates.defaultTreeConfig !== undefined) payload.default_tree_config = updates.defaultTreeConfig

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

  return mapProfileFromDb(data)
}

// Helpers to map between DB snake_case and app camelCase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProfileFromDb(row: any): Profile {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    location: row.location,
    website: row.website,
    skills: row.skills,
    creativePhilosophy: row.creative_philosophy,
    lookingForCollaboration: row.looking_for_collaboration,
    portfolioUrl: row.portfolio_url,
    onboardingCompleted: row.onboarding_completed,
    defaultTreeColor: row.default_tree_color,
    defaultTreeConfig: row.default_tree_config,
    isAdmin: row.is_admin ?? false,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export async function setOnboardingCompleted(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', userId)

  if (error) {
    console.error('Error setting onboarding completed (Full):', JSON.stringify(error, null, 2))
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return false
  }

  return true
}

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
  garden_x?: number | null
  garden_y?: number | null
  tree_config?: any | null
  created_at?: string | null
  updated_at?: string | null
  profiles?: any
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
    forestX: row.garden_x ?? undefined,
    forestY: row.garden_y ?? undefined,
    treeConfig: row.tree_config as any,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    user: row.profiles ? mapProfileFromDb(row.profiles) : undefined
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
    ...(p.forestX !== undefined ? { garden_x: p.forestX } : {}),
    ...(p.forestY !== undefined ? { garden_y: p.forestY } : {}),
    ...(p.treeConfig !== undefined ? { tree_config: p.treeConfig } : {}),
  }
}

// Project queries
export async function getProjects(userId?: string): Promise<Project[]> {
  // Fetch projects with their owner profiles to allow for tree customization
  const base = supabase.from('projects')
    .select(`
      id, user_id, name, description, color, status, is_public, tags, 
      cover_image_url, tribe_id, garden_x, garden_y, tree_config, 
      created_at, updated_at,
      profiles (
        id, username, full_name, avatar_url, default_tree_color, default_tree_config
      )
    `)
    .order('created_at', { ascending: false })

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
    .select(`
      id, user_id, name, description, color, status, is_public, tags, 
      cover_image_url, tribe_id, garden_x, garden_y, tree_config, 
      created_at, updated_at,
      profiles (
        id, username, full_name, avatar_url, default_tree_color, default_tree_config
      )
    `)
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
      id, name, slug, description, cover_image_url, icon_url, 
      creator_id, is_public, member_count, post_count, tags, 
      created_at, updated_at,
      creator:profiles(id, username, full_name, avatar_url),
      tribe_memberships!inner(*)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tribes:', error)
    return []
  }

  return (data || []).map((tribe: any) => ({
    ...mapTribeFromDb(tribe as DbTribe),
    creator: tribe.creator?.[0] || tribe.creator,
    isMember: tribe.tribe_memberships?.length > 0,
    userRole: tribe.tribe_memberships?.[0]?.role,
  })) as unknown as Tribe[]
}

export async function getUserTribes(userId: string): Promise<Tribe[]> {
  const { data, error } = await supabase
    .from('tribe_memberships')
    .select(`
      id, role, join_status, joined_at,
      tribe:tribes(
        id, name, slug, description, cover_image_url, icon_url,
        creator_id, is_public, member_count, post_count, tags,
        creator:profiles(id, username, full_name, avatar_url)
      )
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user tribes:', error.message, error.code, error.details)
    return []
  }

  return (data || [])
    .filter((membership: any) => membership.tribe !== null && (membership.join_status === 'approved' || membership.join_status == null))
    .map((membership: any) => ({
      ...mapTribeFromDb(membership.tribe as DbTribe),
      creator: membership.tribe.creator?.[0] || membership.tribe.creator,
      isMember: true,
      userRole: membership.role,
    })) as unknown as Tribe[]
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
    status: (row.status as TribeStatus) || 'active',
    rejectionReason: (row.rejection_reason as string | undefined) || undefined,
    color: (row.color as string) || '#6366f1',
    memberCount: row.member_count,
    postCount: row.post_count,
    tags: row.tags || undefined,
    rules: row.rules || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
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
  if (t.color) db.color = t.color
  return db
}

export async function createTribe(tribe: Partial<Tribe>): Promise<Tribe | null> {
  const { data, error } = await supabase
    .from('tribes')
    .insert({ ...mapTribeToDb(tribe), status: 'active' })
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

export async function joinTribe(userId: string, tribeId: string): Promise<'approved' | 'pending' | false> {
  // Check if tribe is public to determine approval flow
  const { data: tribeData } = await supabase
    .from('tribes')
    .select('is_public')
    .eq('id', tribeId)
    .single()

  const joinStatus = tribeData?.is_public ? 'approved' : 'pending'

  const { error } = await supabase
    .from('tribe_memberships')
    .insert({
      user_id: userId,
      tribe_id: tribeId,
      role: 'member',
      join_status: joinStatus,
    })

  if (error) {
    if (error.code === '23505') return joinStatus // already requested
    console.error('Error joining tribe:', error)
    return false
  }

  return joinStatus
}

export async function getPendingJoinRequests(tribeId: string): Promise<TribeMembership[]> {
  const { data, error } = await supabase
    .from('tribe_memberships')
    .select(`
      id, tribe_id, user_id, role, join_status, joined_at,
      user:profiles(id, username, full_name, avatar_url, bio)
    `)
    .eq('tribe_id', tribeId)
    .eq('join_status', 'pending')
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error fetching pending join requests:', error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    tribeId: row.tribe_id,
    userId: row.user_id,
    role: row.role as TribeRole,
    joinStatus: row.join_status,
    joinedAt: new Date(row.joined_at),
    user: row.user ? mapProfileFromDb(row.user) : undefined,
  }))
}

export async function approveJoinRequest(tribeId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tribe_memberships')
    .update({ join_status: 'approved' })
    .eq('tribe_id', tribeId)
    .eq('user_id', userId)

  if (error) { console.error('Error approving join request:', error); return false }

  // Increment member count
  await supabase.rpc('increment_member_count', { tribe_id: tribeId }).catch(() => {
    supabase.from('tribes').update({ member_count: supabase.rpc('increment', {}) }).eq('id', tribeId)
  })

  return true
}

export async function rejectJoinRequest(tribeId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tribe_memberships')
    .update({ join_status: 'rejected' })
    .eq('tribe_id', tribeId)
    .eq('user_id', userId)

  if (error) { console.error('Error rejecting join request:', error); return false }
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
  parent_post_id?: string | null
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
    parentPostId: row.parent_post_id || undefined,
  }
}

export async function getPosts(limit = 50, offset = 0, projectId?: string, userId?: string): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select(`
      id, user_id, project_id, tribe_id, type, title, content, 
      media_url, media_type, thumbnail_url, is_featured, view_count, 
      created_at, updated_at,
      user:profiles(id, username, full_name, avatar_url),
      project:projects(id, name, color, status),
      tribe:tribes(id, name, slug),
      likes:likes(count),
      comments:comments(count)
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

  return (data || []).map((row: any) => ({
    ...mapPostFromDb(row as DbPost),
    likeCount: row.likes?.[0]?.count || 0,
    commentCount: row.comments?.[0]?.count || 0,
  }))
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
  if (post.parentPostId) { dbPost.parent_post_id = post.parentPostId; delete dbPost.parentPostId }

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
  if (updates.parentPostId) { dbPost.parent_post_id = updates.parentPostId; delete dbPost.parentPostId }

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
  parent_id?: string | null
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
    parentId: row.parent_id || undefined,
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
  if (c.parentId) db.parent_id = c.parentId
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

export async function updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel | null> {
  const { data, error } = await supabase
    .from('channels')
    .update(mapChannelToDb(updates))
    .eq('id', channelId)
    .select(`
      *,
      blocks(*)
    `)
    .single()

  if (error) {
    console.error('Error updating channel:', error)
    return null
  }

  return mapChannelFromDb(data as DbChannel)
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
    .select('id, channel_id, type, title, content, description, metadata, order_index, created_at, updated_at')
    .eq('channel_id', channelId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching blocks:', error)
    return []
  }

  return ((data || []) as unknown as DbBlock[]).map(mapBlockFromDb)
}

export async function getProjectBlocks(projectId: string): Promise<Block[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select(`
      id, channel_id, type, title, content, description, metadata, order_index, created_at, updated_at,
      channels!inner(project_id)
    `)
    .eq('channels.project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching project blocks:', error)
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

// Extended Tribe queries

export async function getTribeBySlug(slug: string, currentUserId?: string): Promise<Tribe | null> {
  const { data, error } = await supabase
    .from('tribes')
    .select(`
      id, name, slug, description, cover_image_url, icon_url,
      creator_id, is_public, status, rejection_reason, color,
      member_count, post_count, tags, rules, created_at, updated_at,
      creator:profiles(id, username, full_name, avatar_url)
    `)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('Error fetching tribe by slug:', error)
    return null
  }
  if (!data) return null

  // Check membership if user is logged in
  let isMember = false
  let userRole: 'member' | 'moderator' | 'admin' | undefined
  if (currentUserId) {
    const { data: mem } = await supabase
      .from('tribe_memberships')
      .select('role')
      .eq('tribe_id', data.id)
      .eq('user_id', currentUserId)
      .maybeSingle()
    if (mem) { isMember = true; userRole = mem.role as typeof userRole }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any
  return {
    ...mapTribeFromDb(row as DbTribe),
    creator: row.creator,
    isMember,
    userRole,
  } as Tribe
}

export async function getTribeMembers(tribeId: string): Promise<TribeMembership[]> {
  const { data, error } = await supabase
    .from('tribe_memberships')
    .select(`
      id, tribe_id, user_id, role, join_status, joined_at,
      user:profiles(id, username, full_name, avatar_url, bio)
    `)
    .eq('tribe_id', tribeId)
    .eq('join_status', 'approved')
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error fetching tribe members:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((row: any) => ({
    id: row.id,
    tribeId: row.tribe_id,
    userId: row.user_id,
    role: row.role as TribeRole,
    joinStatus: row.join_status,
    joinedAt: new Date(row.joined_at),
    user: row.user ? mapProfileFromDb(row.user) : undefined,
  }))
}

export async function getTribePosts(tribeId: string, limit = 50, offset = 0): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, user_id, project_id, tribe_id, type, title, content,
      media_url, media_type, thumbnail_url, is_featured, view_count,
      created_at, updated_at,
      user:profiles(id, username, full_name, avatar_url),
      project:projects(id, name, color, status),
      likes:likes(count),
      comments:comments(count)
    `)
    .eq('tribe_id', tribeId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching tribe posts:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((row: any) => ({
    ...mapPostFromDb(row as DbPost),
    likeCount: row.likes?.[0]?.count || 0,
    commentCount: row.comments?.[0]?.count || 0,
  }))
}

export async function getTribeProjects(tribeId: string): Promise<Project[]> {
  // Try junction table first (supports multiple tribes per project)
  const { data: junctionData, error: junctionError } = await supabase
    .from('project_tribes')
    .select(`
      project:projects(
        id, user_id, name, description, color, status, is_public, tags,
        cover_image_url, tribe_id, garden_x, garden_y, tree_config,
        created_at, updated_at,
        profiles(id, username, full_name, avatar_url, default_tree_color, default_tree_config)
      )
    `)
    .eq('tribe_id', tribeId)

  if (!junctionError && junctionData) {
    return (junctionData || [])
      .map((row: any) => row.project)
      .filter(Boolean)
      .map((p: any) => mapProjectFromDb({ ...p, profiles: p.profiles?.[0] || p.profiles } as DbProject))
  }

  // Fallback: query by tribe_id column directly
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, user_id, name, description, color, status, is_public, tags,
      cover_image_url, tribe_id, garden_x, garden_y, tree_config,
      created_at, updated_at,
      profiles(id, username, full_name, avatar_url)
    `)
    .eq('tribe_id', tribeId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tribe projects:', error)
    return []
  }

  return ((data || []) as DbProject[]).map(mapProjectFromDb)
}

export async function assignProjectToTribe(projectId: string, tribeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('project_tribes')
    .insert({ project_id: projectId, tribe_id: tribeId })

  if (error) {
    if (error.code === '23505') return true // already assigned, not an error
    console.error('Error assigning project to tribe:', error)
    return false
  }

  return true
}

export async function removeProjectFromTribe(projectId: string, tribeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('project_tribes')
    .delete()
    .eq('project_id', projectId)
    .eq('tribe_id', tribeId)

  if (error) {
    console.error('Error removing project from tribe:', error)
    return false
  }

  return true
}

export async function updateTribe(tribeId: string, updates: Partial<Tribe>): Promise<Tribe | null> {
  const { data, error } = await supabase
    .from('tribes')
    .update(mapTribeToDb(updates))
    .eq('id', tribeId)
    .select(`*, creator:profiles(id, username, full_name, avatar_url)`)
    .single()

  if (error) {
    console.error('Error updating tribe:', error)
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any
  return { ...mapTribeFromDb(row), creator: row.creator } as Tribe
}

export async function deleteTribe(tribeId: string): Promise<boolean> {
  const { error } = await supabase.from('tribes').delete().eq('id', tribeId)
  if (error) { console.error('Error deleting tribe:', error); return false }
  return true
}

export async function promoteMember(tribeId: string, userId: string, role: TribeRole): Promise<boolean> {
  const { error } = await supabase
    .from('tribe_memberships')
    .update({ role })
    .eq('tribe_id', tribeId)
    .eq('user_id', userId)
  if (error) { console.error('Error updating member role:', error); return false }
  return true
}

export async function kickMember(tribeId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tribe_memberships')
    .delete()
    .eq('tribe_id', tribeId)
    .eq('user_id', userId)
  if (error) { console.error('Error kicking member:', error); return false }
  return true
}

export async function getTribeUnlockStatus(userId: string): Promise<TribeUnlockStatus> {
  const { data, error } = await supabase
    .rpc('get_tribe_unlock_status', { p_user_id: userId })

  if (error) {
    console.error('Error fetching unlock status:', error)
    return { streakCount: 0, mediaCount: 0, streakRequired: 7, mediaRequired: 10, isUnlocked: false }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any
  return {
    streakCount: d.streak_count ?? 0,
    mediaCount: d.media_count ?? 0,
    streakRequired: d.streak_required ?? 7,
    mediaRequired: d.media_required ?? 10,
    isUnlocked: d.is_unlocked ?? false,
  }
}

// Admin-only tribe management
export async function getPendingTribes(): Promise<Tribe[]> {
  const { data, error } = await supabase
    .from('tribes')
    .select(`
      id, name, slug, description, cover_image_url, icon_url,
      creator_id, is_public, status, rejection_reason, color,
      member_count, post_count, tags, rules, created_at, updated_at,
      creator:profiles(id, username, full_name, avatar_url)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) { console.error('Error fetching pending tribes:', error); return [] }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((row: any) => ({
    ...mapTribeFromDb(row as DbTribe),
    creator: row.creator,
  })) as Tribe[]
}

export async function approveTribe(tribeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tribes')
    .update({ status: 'active', rejection_reason: null })
    .eq('id', tribeId)
  if (error) { console.error('Error approving tribe:', error); return false }
  return true
}

export async function rejectTribe(tribeId: string, reason: string): Promise<boolean> {
  const { error } = await supabase
    .from('tribes')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', tribeId)
  if (error) { console.error('Error rejecting tribe:', error); return false }
  return true
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

