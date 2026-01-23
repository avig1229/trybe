'use client'

import { useState, useEffect } from 'react'
import { Project, Post } from '@/types'
import { Video, Loader2 } from 'lucide-react'

interface ProjectHoverCardProps {
    project: Project
    posts: Post[]
}

export function ProjectHoverCard({ project, posts }: ProjectHoverCardProps) {
    const [loCommit, setLoCommit] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        // Find the earliest daily_update post with a video
        const videoPost = (posts || [])
            .filter(p => p.type === 'daily_update' && p.mediaUrl && p.mediaType === 'video')
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]

        setLoCommit(videoPost || null)
        setLoading(false)
    }, [posts])

    const totalEngagement = (posts || []).reduce((acc, p) => acc + (p.commentCount || 0), 0)

    return (
        <div className="w-48 bg-black/90 backdrop-blur-xl border border-white/20 p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-3">
                <div className="aspect-[9/16] bg-neutral-900 overflow-hidden relative group">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin opacity-20" />
                        </div>
                    ) : loCommit ? (
                        <video
                            src={loCommit.mediaUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 p-4 text-center">
                            <Video className="h-6 w-6 mb-2 opacity-20" />
                            <span className="text-[8px] uppercase tracking-widest leading-tight">No LoCommit Preview Available</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-tight text-white truncate">
                        {project.name}
                    </h4>
                    <p className="text-[8px] text-neutral-400 line-clamp-2 leading-relaxed">
                        {project.description || 'No description provided.'}
                    </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[7px] uppercase tracking-[0.2em] text-neutral-500">
                            {project.status.toUpperCase()}
                        </span>
                        {totalEngagement > 0 && (
                            <span className="text-[6px] uppercase tracking-[0.1em] text-emerald-500/50 font-bold">
                                ENGAGEMENT_SEQUENCE: {totalEngagement}
                            </span>
                        )}
                    </div>
                    <span className="text-[7px] uppercase tracking-[0.2em] text-emerald-500 font-bold">
                        VIEW_SCOPE
                    </span>
                </div>
            </div>
        </div>
    )
}
