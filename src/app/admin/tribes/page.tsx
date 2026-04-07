import { createClient } from '@/lib/supabase/server'
import { getPendingTribes } from '@/lib/supabase/queries'
import { AdminTribeQueue } from '@/components/AdminTribeQueue'
import { Navigation } from '@/components/navigation'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/supabase/queries'

export const metadata = { title: 'Admin — Tribe Review' }

export default async function AdminTribesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const profile = await getProfile(user.id)
    if (!profile?.isAdmin) redirect('/')

    const pendingTribes = await getPendingTribes()

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentView="tribes" />
            <main className="w-full transition-all duration-300 px-4 md:px-8 py-8">
                <div className="max-w-screen-xl mx-auto py-12">
                    <div className="mb-8">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</p>
                        <h1 className="text-2xl font-black tracking-tight mt-1">Tribe Review Queue</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {pendingTribes.length} tribe{pendingTribes.length !== 1 ? 's' : ''} awaiting approval.
                        </p>
                    </div>
                    <AdminTribeQueue initialTribes={pendingTribes} />
                </div>
            </main>
        </div>
    )
}
