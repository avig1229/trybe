import { createClient } from '@/lib/supabase/server'
import { getTribeUnlockStatus } from '@/lib/supabase/queries'
import { CreateTribeForm } from '@/components/CreateTribeForm'
import { Navigation } from '@/components/navigation'
import { redirect } from 'next/navigation'

export const metadata = {
    title: 'Found a Tribe — Trybe',
}

export default async function NewTribePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const unlockStatus = await getTribeUnlockStatus(user.id)

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentView="tribes" />
            <main className="w-full transition-all duration-300 px-4 md:px-8 py-8">
                <div className="max-w-screen-xl mx-auto py-4">
                    <CreateTribeForm userId={user.id} unlockStatus={unlockStatus} />
                </div>
            </main>
        </div>
    )
}
