'use client'

import { useState } from 'react'
import { Tribe, TribeMembership, Post, Project } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, LogOut, Settings, Crown, Shield, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { leaveTribe, kickMember, promoteMember } from '@/lib/supabase/queries'
import { useRouter } from 'next/navigation'
import { EditTribeModal } from '@/components/EditTribeModal'

interface TribeDetailProps {
    tribe: Tribe
    members: TribeMembership[]
    posts: Post[]
    projects: Project[]
    currentUserId?: string
}

type Tab = 'feed' | 'projects' | 'members'

export function TribeDetail({ tribe, members, posts, projects, currentUserId }: TribeDetailProps) {
    const [activeTab, setActiveTab] = useState<Tab>('feed')
    const [editOpen, setEditOpen] = useState(false)
    const [memberList, setMemberList] = useState(members)
    const router = useRouter()

    const isAdmin = tribe.userRole === 'admin'
    const isModerator = tribe.userRole === 'moderator' || isAdmin

    const handleLeave = async () => {
        if (!currentUserId) return
        await leaveTribe(currentUserId, tribe.id)
        router.refresh()
    }

    const handleKick = async (userId: string) => {
        await kickMember(tribe.id, userId)
        setMemberList(prev => prev.filter(m => m.userId !== userId))
    }

    const handlePromote = async (userId: string, role: 'member' | 'moderator' | 'admin') => {
        await promoteMember(tribe.id, userId, role)
        setMemberList(prev => prev.map(m => m.userId === userId ? { ...m, role } : m))
    }

    const tabs: { id: Tab; label: string; count: number }[] = [
        { id: 'feed', label: 'Feed', count: posts.length },
        { id: 'projects', label: 'Projects', count: projects.length },
        { id: 'members', label: 'Members', count: memberList.length },
    ]

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div
                className="h-48 md:h-64 relative"
                style={{ background: `linear-gradient(135deg, ${tribe.color}22, ${tribe.color}44)` }}
            >
                {tribe.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tribe.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>

            {/* Tribe identity */}
            <div className="max-w-screen-xl mx-auto px-4 md:px-10 -mt-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end gap-5">
                    {/* Icon / color block */}
                    <div
                        className="h-20 w-20 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg flex-shrink-0"
                        style={{ backgroundColor: tribe.color }}
                    >
                        {tribe.iconUrl
                            ? <img src={tribe.iconUrl} alt={tribe.name} className="h-full w-full object-cover rounded-xl" />
                            : tribe.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-black tracking-tight">{tribe.name}</h1>
                            {tribe.isMember && (
                                <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">Member</Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xl">{tribe.description}</p>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {tribe.tags?.map(tag => (
                                <span key={tag} className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pb-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{tribe.memberCount} members</span>
                        </div>
                        {isAdmin && (
                            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="gap-1.5 text-xs">
                                <Settings className="h-3.5 w-3.5" /> Settings
                            </Button>
                        )}
                        {tribe.isMember && !isAdmin && (
                            <Button size="sm" variant="ghost" onClick={handleLeave} className="gap-1.5 text-xs text-red-500 hover:text-red-600">
                                <LogOut className="h-3.5 w-3.5" /> Leave
                            </Button>
                        )}
                    </div>
                </div>

                {/* Rules callout */}
                {tribe.rules && tribe.rules.filter(r => r.trim()).length > 0 && (
                    <div className="mt-5 border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
                        <p className="text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">Tribe Rules</p>
                        <ol className="space-y-1 list-decimal list-inside text-xs text-muted-foreground">
                            {tribe.rules.filter(r => r.trim()).map((rule, i) => (
                                <li key={i}>{rule}</li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Tabs */}
                <div className="border-b border-neutral-200 dark:border-neutral-800 mt-6 flex gap-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2',
                                activeTab === tab.id
                                    ? 'border-current opacity-100'
                                    : 'border-transparent opacity-40 hover:opacity-70'
                            )}
                        >
                            {tab.label}
                            <span className="ml-2 opacity-50">({tab.count})</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="py-8">
                    {/* Feed Tab */}
                    {activeTab === 'feed' && (
                        <div className="max-w-2xl space-y-4">
                            {posts.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-10 text-center opacity-50">No posts in this tribe yet.</p>
                            ) : posts.map(post => (
                                <div key={post.id} className="border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-7 w-7 rounded-none">
                                            <AvatarImage src={post.user?.avatarUrl} />
                                            <AvatarFallback className="rounded-none text-[10px]">
                                                {post.user?.username?.charAt(0).toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <Link href={`/u/${post.user?.username}`} className="text-xs font-bold hover:underline">
                                                @{post.user?.username}
                                            </Link>
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="ml-auto text-[9px]">{post.type}</Badge>
                                    </div>
                                    <p className="text-sm leading-relaxed">{post.content}</p>
                                    {post.mediaUrl && (
                                        <div className="mt-2">
                                            {post.mediaType?.includes('video')
                                                ? <video src={post.mediaUrl} controls className="w-full max-h-64 object-cover" />
                                                : <img src={post.mediaUrl} alt="" className="w-full max-h-64 object-cover" />
                                            }
                                        </div>
                                    )}
                                    <div className="flex gap-4 text-[10px] text-muted-foreground pt-1">
                                        <span>{post.likeCount} likes</span>
                                        <span>{post.commentCount} comments</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects Tab */}
                    {activeTab === 'projects' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.length === 0 ? (
                                <p className="text-sm text-muted-foreground col-span-full py-10 text-center opacity-50">
                                    No public projects linked to this tribe yet.
                                </p>
                            ) : projects.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => router.push(`/projects/${p.id}`)}
                                    className="border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-400 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold truncate">{p.name}</h3>
                                        <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-all" />
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className={cn(
                                            'text-[10px] uppercase tracking-widest px-2 py-0.5',
                                            p.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                p.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-neutral-100 dark:bg-neutral-800 text-muted-foreground'
                                        )}>
                                            {p.status}
                                        </span>
                                        <Link
                                            href={`/u/${p.user?.username}`}
                                            onClick={e => e.stopPropagation()}
                                            className="text-[10px] opacity-50 hover:opacity-100 ml-auto truncate"
                                        >
                                            @{p.user?.username}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div className="max-w-xl space-y-2">
                            {memberList.map(m => (
                                <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                    <Avatar className="h-8 w-8 rounded-none">
                                        <AvatarImage src={m.user?.avatarUrl} />
                                        <AvatarFallback className="rounded-none text-xs">
                                            {m.user?.username?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/u/${m.user?.username}`} className="text-sm font-bold hover:underline">
                                            @{m.user?.username}
                                        </Link>
                                        <p className="text-[10px] text-muted-foreground truncate">{m.user?.bio}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {m.role === 'admin' && <span title="Admin"><Crown className="h-3.5 w-3.5 text-amber-500" /></span>}
                                        {m.role === 'moderator' && <span title="Moderator"><Shield className="h-3.5 w-3.5 text-sky-500" /></span>}
                                        <span className="text-[10px] uppercase tracking-widest opacity-50">{m.role}</span>

                                        {/* Admin controls */}
                                        {isAdmin && m.userId !== currentUserId && (
                                            <div className="flex gap-1">
                                                {m.role === 'member' && (
                                                    <button
                                                        onClick={() => handlePromote(m.userId, 'moderator')}
                                                        className="text-[10px] px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-700 hover-invert transition-all uppercase tracking-widest"
                                                    >
                                                        Mod
                                                    </button>
                                                )}
                                                {m.role === 'moderator' && (
                                                    <button
                                                        onClick={() => handlePromote(m.userId, 'member')}
                                                        className="text-[10px] px-1.5 py-0.5 border border-neutral-300 dark:border-neutral-700 hover-invert transition-all uppercase tracking-widest"
                                                    >
                                                        Demote
                                                    </button>
                                                )}
                                                {isModerator && (
                                                    <button
                                                        onClick={() => handleKick(m.userId)}
                                                        className="text-[10px] px-1.5 py-0.5 border border-red-300 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all uppercase tracking-widest"
                                                    >
                                                        Kick
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {editOpen && (
                <EditTribeModal
                    tribe={tribe}
                    onClose={() => setEditOpen(false)}
                    onSave={() => { setEditOpen(false); router.refresh() }}
                />
            )}
        </div>
    )
}
