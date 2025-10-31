import { createClient } from './client'
import { Profile, Project, Tribe, Post, Block, Channel } from '@/types'

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

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single()

  if (error) {
    console.error('Error updating profile:', error)
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
    .single()

  if (error) {
    console.error('Error updating project:', error)
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

export async function createTribe(tribe: Partial<Tribe>): Promise<Tribe | null> {
  const { data, error } = await supabase
    .from('tribes')
    .insert(tribe)
    .select(`
      *,
      creator:profiles(*)
    `)
    .single()

  if (error) {
    console.error('Error creating tribe:', error)
    return null
  }

  return data as Tribe
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
export async function getPosts(limit = 20, offset = 0): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:profiles(*),
      project:projects(*),
      tribe:tribes(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  // Get like and comment counts for each post
  const postsWithCounts = await Promise.all(
    (data || []).map(async (post) => {
      const [likeCount, commentCount] = await Promise.all([
        getPostLikeCount(post.id),
        getPostCommentCount(post.id)
      ])

      return {
        ...post,
        likeCount,
        commentCount,
        isLiked: false, // Will be determined by user context
        isSaved: false, // Will be determined by user context
      }
    })
  )

  return postsWithCounts as Post[]
}

export async function createPost(post: Partial<Post>): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select(`
      *,
      user:profiles(*),
      project:projects(*),
      tribe:tribes(*)
    `)
    .single()

  if (error) {
    console.error('Error creating post:', error)
    return null
  }

  return data as Post
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

  return (data || []).map(channel => ({
    ...channel,
    blockCount: channel.blocks?.length || 0,
  })) as Channel[]
}

export async function createChannel(channel: Partial<Channel>): Promise<Channel | null> {
  const { data, error } = await supabase
    .from('channels')
    .insert(channel)
    .select()
    .single()

  if (error) {
    console.error('Error creating channel:', error)
    return null
  }

  return data as Channel
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

  return data as Block[]
}

export async function createBlock(block: Partial<Block>): Promise<Block | null> {
  const { data, error } = await supabase
    .from('blocks')
    .insert(block)
    .select()
    .single()

  if (error) {
    console.error('Error creating block:', error)
    return null
  }

  return data as Block
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

