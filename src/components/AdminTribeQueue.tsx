'use client'

import { useState } from 'react'
import { Tribe } from '@/types'
import { approveTribe, rejectTribe } from '@/lib/supabase/queries'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function AdminTribeQueue({ initialTribes }: { initialTribes: Tribe[] }) {
    const [tribes, setTribes] = useState(initialTribes)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [loading, setLoading] = useState<string | null>(null)

    const handleApprove = async (tribeId: string) => {
        setLoading(tribeId)
        const ok = await approveTribe(tribeId)
        if (ok) setTribes(prev => prev.filter(t => t.id !== tribeId))
        setLoading(null)
    }

    const handleReject = async (tribeId: string) => {
        if (!rejectReason.trim()) return
        setLoading(tribeId)
        const ok = await rejectTribe(tribeId, rejectReason.trim())
        if (ok) { setTribes(prev => prev.filter(t => t.id !== tribeId)); setRejectingId(null); setRejectReason('') }
        setLoading(null)
    }

    if (tribes.length === 0) {
        return (
            <div className="py-20 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-3 text-emerald-500" />
                <p className="text-sm">All caught up — no pending tribes.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {tribes.map(tribe => (
                <div key={tribe.id} className="border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div
                            className="h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-black text-white"
                            style={{ backgroundColor: tribe.color }}
                        >
                            {tribe.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="font-bold text-sm">{tribe.name}</h2>
                                <span className="text-[10px] text-muted-foreground font-mono">/tribes/{tribe.slug}</span>
                                <Link href={`/tribes/${tribe.slug}`} target="_blank">
                                    <ExternalLink className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                                </Link>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{tribe.description}</p>

                            {/* Creator */}
                            {tribe.creator && (
                                <div className="flex items-center gap-2 mt-2">
                                    <Avatar className="h-5 w-5 rounded-none">
                                        <AvatarImage src={tribe.creator.avatarUrl} />
                                        <AvatarFallback className="text-[8px]">{tribe.creator.username?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <Link href={`/u/${tribe.creator.username}`} className="text-[10px] hover:underline">
                                        @{tribe.creator.username}
                                    </Link>
                                    <span className="text-[10px] text-muted-foreground">
                                        · submitted {new Date(tribe.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags + Rules */}
                    <div className="flex flex-wrap gap-1.5">
                        {tribe.tags?.map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full">{tag}</span>
                        ))}
                    </div>
                    {tribe.rules && tribe.rules.filter(r => r.trim()).length > 0 && (
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Rules</p>
                            <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-0.5">
                                {tribe.rules.filter(r => r.trim()).map((rule, i) => <li key={i}>{rule}</li>)}
                            </ol>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Button
                            size="sm"
                            onClick={() => handleApprove(tribe.id)}
                            disabled={loading === tribe.id}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                        >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {loading === tribe.id ? 'Approving…' : 'Approve'}
                        </Button>

                        {rejectingId === tribe.id ? (
                            <div className="flex flex-col gap-2 w-full max-w-sm">
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder="Reason for rejection (sent to creator)"
                                    rows={2}
                                    className="w-full bg-transparent border border-red-300 px-3 py-2 text-xs outline-none resize-none"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleReject(tribe.id)}
                                        disabled={loading === tribe.id || !rejectReason.trim()}
                                        variant="destructive"
                                        className="gap-2"
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                        {loading === tribe.id ? 'Rejecting…' : 'Confirm Reject'}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => { setRejectingId(null); setRejectReason('') }}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setRejectingId(tribe.id)}
                                className="gap-2 text-red-500 hover:text-red-600"
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
