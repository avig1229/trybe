import { createClient } from '@/lib/supabase/server'
import { getTribeBySlug, getTribeMembers, getTribePosts, getTribeProjects } from '@/lib/supabase/queries'
import { TribeDetail } from '@/components/TribeDetail'
import { Navigation } from '@/components/navigation'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    return {
        title: `${slug} — Trybe Tribes`,
    }
}

export default async function TribeSlugPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const tribe = await getTribeBySlug(slug, user?.id)
    if (!tribe) notFound()

    const [members, posts, projects] = await Promise.all([
        getTribeMembers(tribe.id),
        getTribePosts(tribe.id, 30, 0),
        getTribeProjects(tribe.id),
    ])

    return (
        <div className="min-h-screen bg-background">
            <Navigation currentView="tribes" />
            <main className="w-full transition-all duration-300 px-0 md:px-8 py-0 md:py-8">
                <TribeDetail
                    tribe={tribe}
                    members={members}
                    posts={posts}
                    projects={projects}
                    currentUserId={user?.id}
                />
            </main>
        </div>
    )
}
