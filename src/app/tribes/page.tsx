import { createClient } from '@/lib/supabase/server'
import { getTribes, getUserTribes, getTribeUnlockStatus } from '@/lib/supabase/queries'
import TribesPageClient from './TribesPageClient'

export const metadata = {
    title: 'Tribes — Trybe',
    description: 'Discover and join creator micro-communities',
}

export default async function TribesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const [allTribes, userTribes, unlockStatus] = await Promise.all([
        getTribes(),
        user ? getUserTribes(user.id) : Promise.resolve([]),
        user ? getTribeUnlockStatus(user.id) : Promise.resolve({
            streakCount: 0, mediaCount: 0, streakRequired: 7, mediaRequired: 10, isUnlocked: false
        }),
    ])

    // Mark membership on allTribes
    const userTribeIds = new Set(userTribes.map(t => t.id))
    const tribesWithMembership = allTribes.map(t => ({
        ...t,
        isMember: userTribeIds.has(t.id),
        userRole: userTribes.find(ut => ut.id === t.id)?.userRole,
    }))

    return (
        <TribesPageClient
            allTribes={tribesWithMembership}
            userTribes={userTribes}
            unlockStatus={unlockStatus}
            userId={user?.id}
        />
    )
}
