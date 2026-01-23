'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Project, Post, Channel, Block } from '@/types'
import {
    Loader2, ArrowLeft, Play, Calendar, User, Zap,
    Layers, Image as ImageIcon, MessageSquare, Quote,
    ChevronRight, ExternalLink, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommentSection } from '@/components/project/CommentSection'
import { getPosts, getChannels, getBlocks } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'

export default function PublicProjectPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.projectId as string

    const [project, setProject] = useState<Project | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [channels, setChannels] = useState<Channel[]>([])
    const [blocks, setBlocks] = useState<Block[]>([])

    const [loading, setLoading] = useState(true)
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
    const supabase = createClient()

    const togglePost = (postId: string) => {
        const newExpanded = new Set(expandedPosts)
        if (newExpanded.has(postId)) {
            newExpanded.delete(postId)
        } else {
            newExpanded.add(postId)
        }
        setExpandedPosts(newExpanded)
    }

    useEffect(() => {
        const fetchAllProjectData = async () => {
            setLoading(true)
            try {
                // 1. Fetch project with profile
                const { data: projectData, error: projectError } = await supabase
                    .from('projects')
                    .select('*, profiles(*)')
                    .eq('id', projectId)
                    .single()

                if (projectError) throw projectError

                const mappedProject: Project = {
                    id: projectData.id,
                    userId: projectData.user_id,
                    name: projectData.name,
                    description: projectData.description || '',
                    color: projectData.color || 'bg-neutral-900',
                    status: projectData.status,
                    isPublic: projectData.is_public,
                    createdAt: new Date(projectData.created_at),
                    updatedAt: new Date(projectData.updated_at),
                    user: projectData.profiles ? {
                        id: projectData.profiles.id,
                        username: projectData.profiles.username,
                        fullName: projectData.profiles.full_name,
                        avatarUrl: projectData.profiles.avatar_url,
                        onboardingCompleted: projectData.profiles.onboarding_completed,
                        createdAt: new Date(projectData.profiles.created_at),
                        updatedAt: new Date(projectData.profiles.updated_at),
                        lookingForCollaboration: projectData.profiles.looking_for_collaboration
                    } : undefined
                }
                setProject(mappedProject)

                // 2. Parallel fetch for posts, channels, and blocks
                const [projectPosts, projectChannels] = await Promise.all([
                    getPosts(100, 0, projectId),
                    getChannels(projectId)
                ])

                setPosts(projectPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
                setChannels(projectChannels)

                // 3. Fetch blocks for all channels
                const allBlocks = await Promise.all(projectChannels.map(c => getBlocks(c.id)))
                setBlocks(allBlocks.flat())

            } catch (error) {
                console.error('Error fetching public project details:', error)
            } finally {
                setLoading(false)
            }
        }

        if (projectId) fetchAllProjectData()
    }, [projectId])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin opacity-20" />
                    <span className="text-[10px] uppercase tracking-[0.5em] text-white/50">Initializing_Preview</span>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
                <h1 className="text-2xl font-bold uppercase tracking-tighter">Sequence_Lost</h1>
                <Button variant="ghost" onClick={() => router.back()} className="text-[10px] uppercase tracking-widest">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Return_to_Forest
                </Button>
            </div>
        )
    }

    // Filter images for The Board
    const moodboardImages = [
        ...posts.filter(p => p.mediaType === 'image').map(p => ({ url: p.mediaUrl!, title: p.title, type: 'Update' })),
        ...blocks.filter(b => b.type === 'image').map(b => ({ url: b.content, title: b.title || 'Untitled', type: 'resource' }))
    ]

    // Filter videos for The Showcase
    const showcaseVideos = posts.filter(p => p.mediaType === 'video')

    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-white selection:text-black scroll-smooth">
            {/* Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/10 transition-all rounded-none px-4 flex items-center"
                    >
                        <ArrowLeft className="h-3 w-3 mr-2" /> Escape
                    </Button>
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <div className="text-[10px] uppercase tracking-widest font-bold hidden sm:block">
                        {project.name} <span className="opacity-30 mx-2">//</span> <span className="opacity-50">@{project.user?.username}</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <a href="#feedback" className="text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" /> FEEDBACK
                    </a>
                </div>
            </header>

            <main className="pt-24 pb-32">
                {/* 1. Hero Section */}
                <section className="px-6 md:px-12 lg:px-24 py-20 space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-emerald-500">{project.status}</span>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] max-w-5xl">
                            {project.name}
                        </h1>
                        <div className="flex flex-col md:flex-row gap-12 pt-8">
                            <div className="max-w-2xl space-y-6">
                                <div className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 flex items-center gap-2">
                                    <Quote className="h-3 w-3" /> Project_Manifesto
                                </div>
                                <p className="text-xl md:text-2xl font-light text-neutral-400 leading-relaxed italic">
                                    {project.description}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-8 md:flex md:flex-col md:gap-8 shrink-0">
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase tracking-widest opacity-30">Architect</div>
                                    <div className="text-sm font-bold uppercase tracking-widest text-emerald-500">@{project.user?.username}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase tracking-widest opacity-30">Inception</div>
                                    <div className="text-sm font-bold uppercase tracking-widest font-mono">
                                        {new Date(project.createdAt).getFullYear()}.{new Date(project.createdAt).getMonth() + 1}.{new Date(project.createdAt).getDate()}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase tracking-widest opacity-30">Activity</div>
                                    <div className="text-sm font-bold uppercase tracking-widest">{posts.length} LOCOMMITS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. The Showcase (Horizontal Scroll) */}
                {showcaseVideos.length > 0 && (
                    <section className="py-32 space-y-12 bg-zinc-950/50">
                        <div className="px-6 md:px-12 lg:px-24 flex items-baseline justify-between transition-all">
                            <h2 className="text-xs uppercase tracking-[0.8em] font-bold opacity-40 italic">The_Showcase</h2>
                            <span className="text-[8px] uppercase tracking-widest opacity-20">{showcaseVideos.length} REELS</span>
                        </div>
                        <div className="flex overflow-x-auto no-scrollbar gap-6 px-6 md:px-12 lg:px-24 pb-8 snap-x">
                            {showcaseVideos.map((video, i) => (
                                <div key={video.id} className="min-w-[70vw] md:min-w-[320px] aspect-[9/16] bg-neutral-900 relative group overflow-hidden border border-white/5 snap-center">
                                    <video
                                        src={video.mediaUrl}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 font-mono"
                                        muted
                                        loop
                                        playsInline
                                        onMouseEnter={(e) => e.currentTarget.play()}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.pause()
                                            e.currentTarget.currentTime = 0
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-6 left-6 right-6 space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="text-[8px] uppercase tracking-widest font-bold text-emerald-400">SEQUENCE_{showcaseVideos.length - i}</div>
                                        <h3 className="text-lg font-bold uppercase tracking-tighter truncate">{video.title}</h3>
                                        <div className="text-[8px] uppercase tracking-widest opacity-40 font-bold">{video.type}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. The Board (Moodboard) */}
                {moodboardImages.length > 0 && (
                    <section className="px-6 md:px-12 lg:px-24 py-32 space-y-12">
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-xs uppercase tracking-[0.8em] font-bold opacity-40 italic">The_Board</h2>
                            <span className="text-[8px] uppercase tracking-widest opacity-20">AESTHETIC_DNA</span>
                        </div>
                        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
                            {moodboardImages.map((img, i) => (
                                <div key={i} className="break-inside-avoid relative group overflow-hidden border border-white/5 bg-neutral-900">
                                    <img
                                        src={img.url}
                                        alt=""
                                        className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all pointer-events-none" />
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-baseline opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[8px] uppercase tracking-widest font-bold bg-black/60 backdrop-blur-md px-2 py-1">{img.title}</span>
                                        <span className="text-[8px] uppercase tracking-[0.4em] opacity-40">{img.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. Project Resources (Channels) */}
                {channels.length > 0 && (
                    <section className="px-6 md:px-12 lg:px-24 py-32 space-y-12 border-t border-white/5">
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-xs uppercase tracking-[0.8em] font-bold opacity-40 italic">Project_Channels</h2>
                            <div className="flex gap-4">
                                {channels.map(c => (
                                    <span key={c.id} className="text-[8px] uppercase tracking-widest px-2 py-1 bg-white/5">{c.name}</span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {channels.map((channel) => {
                                const channelBlocks = blocks.filter(b => b.channelId === channel.id)
                                if (channelBlocks.length === 0) return null

                                return (
                                    <div key={channel.id} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full border border-white/30" />
                                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">{channel.name}</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {channelBlocks.map((block) => (
                                                <div key={block.id} className="p-4 bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[8px] uppercase tracking-widest opacity-30">{block.type}</span>
                                                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" />
                                                    </div>
                                                    <h4 className="text-sm font-bold uppercase tracking-widest mb-2 truncate">{block.title}</h4>
                                                    {block.type === 'text' && (
                                                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-light">{block.content}</p>
                                                    )}
                                                    {block.type === 'link' && (
                                                        <a href={block.content} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-500 uppercase flex items-center gap-2 hover:underline">
                                                            <ExternalLink className="h-3 w-3" /> Visit Reference
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* 5. The Pulse (Branching Timeline / Feedback) */}
                <section className="px-6 md:px-12 lg:px-24 py-32 space-y-20 border-t border-white/5 relative bg-[#080808]">
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 relative z-10">
                        <div className="space-y-4">
                            <h2 className="text-[40px] md:text-6xl font-black uppercase tracking-tighter">The_Pulse</h2>
                            <p className="text-xs uppercase tracking-[0.4em] font-bold opacity-30 italic">Organic_Feedback_Branches</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <div className="text-[10px] uppercase tracking-widest opacity-20">INTEGRATED_SEQUENCE_LAYER</div>
                            <div className="text-[8px] uppercase tracking-[0.2em] opacity-10 font-bold max-w-[200px]">
                                SELECT_CELLS_TO_EXPAND_EVIDENCE_STREAM
                            </div>
                        </div>
                    </div>

                    <div className="space-y-48 relative pt-20">
                        {/* Vertical Branch (Trunk) */}
                        <div className="absolute left-6 md:left-[50%] top-0 bottom-0 w-px bg-white/20 z-0" />

                        {posts.map((post, i) => {
                            const isExpanded = expandedPosts.has(post.id)

                            return (
                                <div key={post.id} className={cn(
                                    "relative z-10 flex flex-col gap-12",
                                    i % 2 === 0 ? "md:items-start" : "md:items-end"
                                )}>
                                    {/* Node on Trunk */}
                                    <div className="absolute left-6 md:left-[50%] top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-white z-20 shadow-[0_0_20px_rgba(255,255,255,0.3)]" />

                                    {/* content branch */}
                                    <div className={cn(
                                        "md:w-[45%] flex flex-col gap-8 ml-12 md:ml-0",
                                        i % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                                    )}>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="text-[8px] uppercase tracking-[0.4em] font-bold opacity-40">
                                                    LOG_{posts.length - i} // {new Date(post.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="px-2 py-0.5 border border-white/10 text-[8px] uppercase tracking-widest font-black opacity-60">
                                                    {post.type}
                                                </div>
                                            </div>
                                            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none hover:text-emerald-500 transition-colors cursor-default">
                                                {post.title}
                                            </h3>
                                            <p className="text-lg text-neutral-400 font-light leading-relaxed italic border-l border-white/10 pl-6">
                                                {post.content}
                                            </p>

                                            <div className="pt-4 flex">
                                                <Button
                                                    onClick={() => togglePost(post.id)}
                                                    className={cn(
                                                        "rounded-none uppercase text-[10px] tracking-widest h-10 px-8 transition-all font-bold",
                                                        isExpanded
                                                            ? "bg-zinc-800 text-white hover:bg-zinc-700"
                                                            : "bg-white text-black hover:bg-zinc-200"
                                                    )}
                                                >
                                                    {isExpanded ? 'CLOSE_COMMIT [-]' : 'VIEW_COMMIT [+]'}
                                                </Button>
                                            </div>

                                            {isExpanded && post.mediaUrl && (
                                                <div className="aspect-[9/16] max-w-[300px] grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden border border-white/5 bg-neutral-900 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                                                    {post.mediaType === 'video' ? (
                                                        <video src={post.mediaUrl} className="w-full h-full object-cover font-mono" controls autoPlay muted />
                                                    ) : (
                                                        <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Feedback Node (Branching off the update) */}
                                        {isExpanded && (
                                            <div className="pt-12 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-700">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="text-[9px] uppercase tracking-[0.4em] font-black opacity-30 italic">Branch_Terminal: FEEDBACK_SEQUENCE</div>
                                                    <div className="h-px flex-1 bg-white/5" />
                                                </div>
                                                <CommentSection postId={post.id} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* 6. End of Sequence */}
                <section id="feedback" className="px-6 md:px-12 lg:px-24 py-12 border-t border-white/5 text-center opacity-20">
                    <span className="text-[8px] uppercase tracking-[1em]">End_of_Pulse</span>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 px-12 py-20 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                <div className="space-y-4">
                    <div className="text-[12px] uppercase tracking-[0.6em] font-bold">Trybe_Sequence_V0.1</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-30">Built for the obsessive. Powered by Pulse.</div>
                </div>
                <div className="flex gap-12">
                    <div className="space-y-2">
                        <div className="text-[8px] uppercase tracking-[0.4em] font-bold opacity-30">ARCHITECT</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest">@{project.user?.username}</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-[8px] uppercase tracking-[0.4em] font-bold opacity-30">SEQUENCE_ID</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest">{project.id.slice(0, 8)}</div>
                    </div>
                </div>
                <div className="text-[8px] uppercase tracking-[0.8em] opacity-20">TRUST_THE_PROCESS</div>
            </footer>
        </div>
    )
}
