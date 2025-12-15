import { Profile, Project, Post } from '@/types'
import { cn } from '@/lib/utils'
import { Play } from 'lucide-react'
import { useState } from 'react'

interface HomeDashboardProps {
    profile: Profile
    projects: Project[]
    recentPosts: Post[]
    onSelectProject: (project: Project) => void
    onCreateProject?: () => void
}

export function HomeDashboard({ profile, projects, recentPosts, onSelectProject, onCreateProject }: HomeDashboardProps) {
    const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null)
    const [playingVideo, setPlayingVideo] = useState<string | null>(null)

    // Filter for reel items (videos and images)
    const reelItems = recentPosts.filter(p => p.mediaUrl && (p.mediaType === 'video' || p.mediaType === 'image'))

    return (
        <div className="max-w-screen-2xl mx-auto space-y-24 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-light tracking-tight">
                    Welcome back, <span className="font-bold">{profile.fullName?.split(' ')[0] || profile.username}</span>.
                </h1>
                <p className="text-xl text-muted-foreground font-light max-w-2xl">
                    Your creative ecosystem is active. You have {projects.length} ongoing projects and a {new Date().getDay() > 0 ? 'growing' : 'fresh'} daily streak.
                </p>
            </div>

            {/* Global Reel */}
            {reelItems.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-baseline justify-between border-b border-black/10 dark:border-white/10 pb-4">
                        <h3 className="text-xs uppercase tracking-[0.2em] opacity-50">Global Reel</h3>
                        <span className="text-[10px] uppercase tracking-widest opacity-40">Recent Activity</span>
                    </div>

                    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 snap-x">
                        {reelItems.map(post => (
                            <div
                                key={post.id}
                                className="flex-shrink-0 w-[200px] md:w-[280px] aspect-[9/16] bg-neutral-100 dark:bg-neutral-900 relative group overflow-hidden snap-center cursor-pointer"
                                onClick={() => setPlayingVideo(playingVideo === post.id ? null : post.id)}
                            >
                                {post.mediaType === 'video' ? (
                                    playingVideo === post.id ? (
                                        <video
                                            src={post.mediaUrl}
                                            autoPlay
                                            preload="auto"
                                            loop
                                            muted
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <>
                                            <video
                                                preload="metadata"
                                                src={post.mediaUrl}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                onMouseOver={e => e.currentTarget.play().catch(() => { })}
                                                onMouseOut={e => {
                                                    e.currentTarget.pause()
                                                    e.currentTarget.currentTime = 0
                                                }}
                                                muted
                                                loop
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Play className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" />
                                            </div>
                                        </>
                                    )
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={post.mediaUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                )}

                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-[10px] uppercase tracking-widest font-bold truncate">{post.project?.name || 'Untitled Project'}</p>
                                    <p className="text-xs truncate">{post.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-12">
                {/* Project Grid */}
                <div className="space-y-8">
                    <div className="flex items-baseline justify-between border-b border-black/10 dark:border-white/10 pb-4">
                        <h3 className="text-xs uppercase tracking-[0.2em] opacity-50">Active Projects</h3>
                        <span className="text-[10px] uppercase tracking-widest opacity-40">{projects.length} Total</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => onSelectProject(project)}
                                onMouseEnter={() => setHoveredProjectId(project.id)}
                                onMouseLeave={() => setHoveredProjectId(null)}
                                className="group relative aspect-video bg-neutral-100 dark:bg-neutral-900 border border-transparent hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                {/* Minimal Status Dot */}
                                <div className={cn(
                                    "absolute top-4 right-4 w-2 h-2 rounded-full z-10",
                                    project.status === 'active' ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-700"
                                )} />

                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-2xl font-bold uppercase tracking-tighter group-hover:translate-x-2 transition-transform duration-300">{project.name}</h4>
                                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 group-hover:translate-x-2 transition-transform duration-300 delay-75">{project.description}</p>
                                    </div>

                                    <div className="flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        <span className="text-[10px] uppercase tracking-widest">{project.status}</span>
                                        <span className="text-[10px] uppercase tracking-widest">Open &rarr;</span>
                                    </div>
                                </div>

                                {/* Background Hover Effect */}
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-tr from-neutral-200/50 to-transparent dark:from-neutral-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                )} />
                            </div>
                        ))}

                        {/* Create New Project Card */}
                        <div
                            className="aspect-video border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-foreground hover:border-foreground transition-all cursor-pointer opacity-50 hover:opacity-100"
                            onClick={onCreateProject}
                        >
                            <div className="text-4xl font-thin">+</div>
                            <span className="text-xs uppercase tracking-widest">Initialize Project</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
