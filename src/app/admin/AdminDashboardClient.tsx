'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Video, Users, TreePine, ChevronRight } from 'lucide-react'
import DailyCheckIn from '@/components/DailyCheckIn'

export default function AdminDashboardClient() {
    const router = useRouter()
    const [locommitOpen, setLocommitOpen] = useState(false)

    const links = [
        {
            label: 'Tribe Review Queue',
            description: 'Approve or reject pending tribe submissions.',
            href: '/admin/tribes',
            icon: Users,
        },
        {
            label: 'The Forest',
            description: 'View the collective pulse — no lock required.',
            href: '/valley?view=pulse',
            icon: TreePine,
        },
    ]

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* LoCommit tile */}
                <button
                    onClick={() => setLocommitOpen(true)}
                    className="text-left border border-neutral-200 dark:border-neutral-800 p-6 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all group"
                >
                    <div className="flex items-start justify-between">
                        <Video className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mt-4">LoCommit</h3>
                    <p className="text-xs text-muted-foreground mt-1">Post a daily update reel to any project.</p>
                </button>

                {/* Nav links */}
                {links.map(({ label, description, href, icon: Icon }) => (
                    <button
                        key={href}
                        onClick={() => router.push(href)}
                        className="text-left border border-neutral-200 dark:border-neutral-800 p-6 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all group"
                    >
                        <div className="flex items-start justify-between">
                            <Icon className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mt-4">{label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </button>
                ))}
            </div>

            {/* LoCommit overlay — on-demand, not a gate */}
            {locommitOpen && (
                <DailyCheckIn onUnlock={() => setLocommitOpen(false)} />
            )}
        </>
    )
}
