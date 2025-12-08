'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ContributionDay {
    date: string // YYYY-MM-DD
    count: number
    level: 0 | 1 | 2 | 3 | 4
}

export function ContributionGraph({ userId }: { userId: string }) {
    const [data, setData] = useState<ContributionDay[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const now = new Date()
            const year = now.getFullYear()
            const month = now.getMonth()

            // Start of current month
            const startDate = new Date(year, month, 1)
            // End of current month
            const endDate = new Date(year, month + 1, 0)

            const { data: posts, error } = await supabase
                .from('posts')
                .select('created_at')
                .eq('user_id', userId)
                .eq('type', 'daily_update')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())

            if (error) {
                console.error('Error fetching contribution data:', error)
                setLoading(false)
                return
            }

            // Process data using local time
            const counts: Record<string, number> = {}
            posts?.forEach(post => {
                const dateObj = new Date(post.created_at)
                const d = String(dateObj.getDate()).padStart(2, '0')
                // We only care about the day for the current month view
                counts[d] = (counts[d] || 0) + 1
            })

            // Generate days for the month
            const days: ContributionDay[] = []
            const current = new Date(startDate)

            while (current <= endDate) {
                const d = String(current.getDate()).padStart(2, '0')
                const dateStr = current.toISOString().split('T')[0]
                const count = counts[d] || 0

                let level: 0 | 1 | 2 | 3 | 4 = 0
                if (count > 0) level = 1
                if (count > 1) level = 2
                if (count > 3) level = 3
                if (count > 5) level = 4

                days.push({ date: dateStr, count, level })
                current.setDate(current.getDate() + 1)
            }

            setData(days)
            setLoading(false)
        }

        fetchData()
    }, [userId])

    if (loading) return <div className="h-32 w-full animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-lg" />

    // Calendar Grid Logic
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday

    // Create grid cells (padding + days)
    const cells: (ContributionDay | null)[] = []

    // Add padding for start of week
    for (let i = 0; i < startDayOfWeek; i++) {
        cells.push(null)
    }

    // Add actual days
    data.forEach(day => cells.push(day))

    return (
        <div className="w-full max-w-[280px]">
            {/* Month Label */}
            <div className="text-[10px] uppercase tracking-widest opacity-50 mb-4">
                {now.toLocaleString('default', { month: 'long' })}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Day Headers (Optional, keeping minimal for now) */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-[8px] text-center opacity-30 py-1">{d}</div>
                ))}

                {cells.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />

                    return (
                        <div
                            key={day.date}
                            title={`${day.date}: ${day.count} updates`}
                            className={cn(
                                "aspect-square rounded-sm transition-colors",
                                day.level === 0 && "bg-neutral-100 dark:bg-neutral-800",
                                day.level === 1 && "bg-green-500/30 dark:bg-green-900",
                                day.level === 2 && "bg-green-500/60 dark:bg-green-700",
                                day.level === 3 && "bg-green-500 dark:bg-green-500",
                                day.level === 4 && "bg-green-600 dark:bg-green-400"
                            )}
                        />
                    )
                })}
            </div>
        </div>
    )
}
