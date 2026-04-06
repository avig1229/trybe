'use client'

import { useState } from 'react'
import { Tribe, TribeUnlockStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Search, Plus, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { joinTribe, leaveTribe } from '@/lib/supabase/queries'
import { TribeUnlockProgress } from '@/components/TribeUnlockProgress'
import { Navigation } from '@/components/navigation'

interface TribesPageClientProps {
    allTribes: Tribe[]
    userTribes: Tribe[]
    unlockStatus: TribeUnlockStatus
    userId?: string
}

type TabView = 'discover' | 'mine'

export default function TribesPageClient({ allTribes, userTribes, unlockStatus, userId }: TribesPageClientProps) {
    const [tab, setTab] = useState<TabView>('discover')
    const [query, setQuery] = useState('')
    const [tribes, setTribes] = useState(allTribes)
    const [myTribes, setMyTribes] = useState(userTribes)

    const filtered = (tab === 'discover' ? tribes : myTribes).filter(t =>
        !query || t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    const handleJoin = async (tribeId: string) => {
        if (!userId) return
        const ok = await joinTribe(userId, tribeId)
        if (!ok) return
        setTribes(prev => prev.map(t => t.id === tribeId ? { ...t, isMember: true, memberCount: t.memberCount + 1 } : t))
    }

    const handleLeave = async (tribeId: string) => {
        if (!userId) return
        const ok = await leaveTribe(userId, tribeId)
        if (!ok) return
        setTribes(prev => prev.map(t => t.id === tribeId ? { ...t, isMember: false, memberCount: t.memberCount - 1 } : t))
        setMyTribes(prev => prev.filter(t => t.id !== tribeId))
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentView="tribes" />
            <main className="w-full transition-all duration-300 px-4 md:px-8 py-8">
                <div className="max-w-screen-xl mx-auto space-y-8">
                    {userId && !unlockStatus.isUnlocked ? (
                        <div className="flex flex-col md:flex-row gap-8 items-center bg-neutral-900 dark:bg-black text-white p-8 rounded-2xl border border-neutral-800">
                            <div className="flex-1 space-y-4">
                                <h1 className="text-3xl font-black tracking-tight">Found a Tribe</h1>
                                <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
                                    Founding a Tribe is a privilege reserved for committed creators. Establish a consistent routine and document your journey to unlock this capability. Once unlocked, you can create a specialized micro-community, set its rules, assign colors, and organize collaboration.
                                </p>
                            </div>
                            <div className="w-full md:w-[380px] flex-shrink-0 dark">
                                <TribeUnlockProgress status={unlockStatus} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            <div className="flex-1">
                                <h1 className="text-3xl font-black tracking-tight">Tribes</h1>
                                <p className="text-muted-foreground text-sm mt-1">Creator micro-communities built on commitment.</p>
                            </div>
                            {userId && unlockStatus.isUnlocked && (
                                <Link href="/tribes/new">
                                    <Button className="gap-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-all shadow-lg hover:-translate-y-1">
                                        <Plus className="h-4 w-4" />
                                        Found a Tribe
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Tabs + Search */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex border border-neutral-200 dark:border-neutral-800">
                            {(['discover', 'mine'] as TabView[]).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={cn(
                                        'px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all',
                                        tab === t ? 'bg-black text-white dark:bg-white dark:text-black' : 'opacity-40 hover:opacity-70'
                                    )}
                                >
                                    {t === 'discover' ? 'Discover' : `My Tribes (${myTribes.length})`}
                                </button>
                            ))}
                        </div>

                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search by name or tag…"
                                className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-neutral-500"
                            />
                        </div>
                    </div>

                    {/* Tribe Grid */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground text-sm opacity-50">
                            {tab === 'mine' ? "You haven't joined any tribes yet." : "No tribes found."}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map(tribe => (
                                <TribeCard
                                    key={tribe.id}
                                    tribe={tribe}
                                    userId={userId}
                                    onJoin={handleJoin}
                                    onLeave={handleLeave}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function TribeCard({
    tribe, userId, onJoin, onLeave
}: {
    tribe: Tribe
    userId?: string
    onJoin: (id: string) => void
    onLeave: (id: string) => void
}) {
    const [loading, setLoading] = useState(false)

    const handleAction = async () => {
        setLoading(true)
        if (tribe.isMember) await onLeave(tribe.id)
        else await onJoin(tribe.id)
        setLoading(false)
    }

    return (
        <div className="group border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all overflow-hidden">
            {/* Color band */}
            <div className="h-1.5" style={{ backgroundColor: tribe.color }} />

            <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                        className="h-10 w-10 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-black text-white"
                        style={{ backgroundColor: tribe.color }}
                    >
                        {tribe.iconUrl
                            ? <Avatar className="h-10 w-10 rounded-lg"><AvatarImage src={tribe.iconUrl} /><AvatarFallback>{tribe.name[0]}</AvatarFallback></Avatar>
                            : tribe.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-sm truncate">{tribe.name}</p>
                            {tribe.isMember && <Badge variant="secondary" className="text-[9px] uppercase tracking-widest flex-shrink-0">Member</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                            <Users className="h-3 w-3" />
                            <span>{tribe.memberCount} members</span>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{tribe.description}</p>

                <div className="flex flex-wrap gap-1.5">
                    {tribe.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                    <Link
                        href={`/tribes/${tribe.slug}`}
                        className="flex items-center gap-1 text-xs opacity-50 hover:opacity-100 transition-opacity"
                    >
                        View <ArrowRight className="h-3 w-3" />
                    </Link>
                    {userId && (
                        <button
                            onClick={handleAction}
                            disabled={loading || tribe.userRole === 'admin'}
                            className={cn(
                                'text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-all font-bold',
                                tribe.isMember
                                    ? 'border-red-300 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500'
                                    : 'border-current hover-invert'
                            )}
                        >
                            {loading ? '…' : tribe.userRole === 'admin' ? <><Crown />&nbsp;Founder</> : tribe.isMember ? 'Leave' : 'Join'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// Crown icon inline to avoid extra import
function Crown() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17l2-7 4 4 3-7 3 7 4-4 2 7H3z" />
        </svg>
    )
}
