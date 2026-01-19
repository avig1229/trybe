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
        <div className="w-full space-y-16 animate-in fade-in duration-700">
            {/* Quick Actions / Jump Start */}
            <div className="space-y-6">
                <div className="flex items-baseline justify-between border-b border-black/10 dark:border-white/10 pb-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] opacity-50 font-bold">Jump Start</h3>
                    <span className="text-[10px] uppercase tracking-widest opacity-40">System Shortcuts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={onCreateProject}
                        className="p-6 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-all bg-neutral-50 dark:bg-neutral-900/50 group text-left"
                    >
                        <p className="text-[10px] uppercase tracking-widest opacity-70 mb-2 font-bold">Workspace</p>
                        <p className="text-sm font-bold uppercase tracking-tight group-hover:translate-x-1 transition-transform">+ Initialize Project</p>
                    </button>
                    <button className="p-6 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-all bg-neutral-50 dark:bg-neutral-900/50 group text-left opacity-70">
                        <p className="text-[10px] uppercase tracking-widest opacity-70 mb-2 font-bold">Collaboration</p>
                        <p className="text-sm font-bold uppercase tracking-tight">Broadcast Update</p>
                    </button>
                    <button className="p-6 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-all bg-neutral-50 dark:bg-neutral-900/50 group text-left opacity-70">
                        <p className="text-[10px] uppercase tracking-widest opacity-70 mb-2 font-bold">Discovery</p>
                        <p className="text-sm font-bold uppercase tracking-tight">Explore Forest</p>
                    </button>
                    <div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/20 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Profile Strength</p>
                            <p className="text-sm font-bold tracking-tight">85% COMPLETE</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">
                    Welcome back, {profile.fullName?.split(' ')[0] || profile.username}.
                </h1>
                <p className="text-lg text-muted-foreground font-light max-w-3xl uppercase tracking-wide">
                    {projects.length} ACTIVE WORKSPACES // {new Date().getDay() > 0 ? 'STABLE' : 'INITIATING'} UPLINK
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
                        <h3 className="text-xs uppercase tracking-[0.2em] opacity-50 font-bold">Active Projects</h3>
                        <span className="text-[10px] uppercase tracking-widest opacity-40">{projects.length} Total</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-neutral-200 dark:border-neutral-800 mt-[-1px]">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => onSelectProject(project)}
                                onMouseEnter={() => setHoveredProjectId(project.id)}
                                onMouseLeave={() => setHoveredProjectId(null)}
                                className="group relative aspect-video bg-neutral-100 dark:bg-neutral-900/40 border-r border-b border-neutral-200 dark:border-neutral-800 hover:z-10 transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                {/* Minimal Status Dot */}
                                <div className={cn(
                                    "absolute top-6 right-6 w-2 h-2 rounded-full z-10",
                                    project.status === 'active' ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-700"
                                )} />

                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-2xl font-bold uppercase tracking-tighter group-hover:translate-x-2 transition-transform duration-300">{project.name}</h4>
                                        <p className="mt-2 text-[10px] uppercase tracking-widest opacity-50 line-clamp-2 group-hover:translate-x-2 transition-transform duration-300 delay-75">{project.description}</p>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 group-hover:opacity-100 transition-opacity">{project.status}</span>
                                        <span className="text-[10px] uppercase tracking-widest font-bold translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">Open &rarr;</span>
                                    </div>
                                </div>

                                {/* Hover Highlight - Outline Style */}
                                <div className="absolute inset-0 border-2 border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        ))}

                        {/* Create New Project Card - Aligned with Grid */}
                        <div
                            className="aspect-video border-r border-b border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all cursor-pointer group"
                            onClick={onCreateProject}
                        >
                            <div className="text-4xl font-thin group-hover:scale-110 transition-transform">+</div>
                            <span className="text-[10px] uppercase tracking-[0.3em]">Initialize Project</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
