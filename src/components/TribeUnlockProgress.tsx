'use client'

import { TribeUnlockStatus } from '@/types'
import { Flame, Image as ImageIcon, Lock } from 'lucide-react'

interface TribeUnlockProgressProps {
    status: TribeUnlockStatus
    compact?: boolean
}

export function TribeUnlockProgress({ status, compact = false }: TribeUnlockProgressProps) {
    const { streakCount, mediaCount, streakRequired, mediaRequired, isUnlocked } = status
    const streakPct = Math.min((streakCount / streakRequired) * 100, 100)
    const mediaPct = Math.min((mediaCount / mediaRequired) * 100, 100)

    if (isUnlocked) return null

    if (compact) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>
                    {streakCount}/{streakRequired}d streak · {mediaCount}/{mediaRequired} uploads
                </span>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 p-5 space-y-4">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                    <p className="text-sm font-bold tracking-wide">Tribe Creation Locked</p>
                    <p className="text-xs text-muted-foreground">Complete both milestones to unlock</p>
                </div>
            </div>

            {/* Streak progress */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        <span className="font-medium">Daily Streak</span>
                    </div>
                    <span className={streakCount >= streakRequired ? 'text-emerald-500 font-bold' : 'text-muted-foreground'}>
                        {streakCount}/{streakRequired} days
                    </span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-500"
                        style={{ width: `${streakPct}%` }}
                    />
                </div>
            </div>

            {/* Media progress */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-violet-500" />
                        <span className="font-medium">Valley Uploads</span>
                    </div>
                    <span className={mediaCount >= mediaRequired ? 'text-emerald-500 font-bold' : 'text-muted-foreground'}>
                        {mediaCount}/{mediaRequired} files
                    </span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-500"
                        style={{ width: `${mediaPct}%` }}
                    />
                </div>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">
                Posting 7 days in a row + 10 Valley uploads earns you the right to found a tribe
            </p>
        </div>
    )
}
