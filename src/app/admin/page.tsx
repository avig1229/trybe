import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/queries'
import { Navigation } from '@/components/navigation'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'

export const metadata = { title: 'Admin Dashboard — Trybe' }

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const profile = await getProfile(user.id)
    if (!profile?.isAdmin) redirect('/')

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentView="valley" />
            <main className="w-full px-4 md:px-8 py-8">
                <div className="max-w-screen-xl mx-auto py-12 space-y-12">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin</p>
                        <h1 className="text-2xl font-black tracking-tight mt-1">Dashboard</h1>
                    </div>
                    <AdminDashboardClient />
                </div>
            </main>
        </div>
    )
}
