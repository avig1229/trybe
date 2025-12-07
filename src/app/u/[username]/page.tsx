'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProfileByUsername, getProjects, updateProfile } from '@/lib/supabase/queries'
import { Profile, Project } from '@/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ContributionGraph } from '@/components/ContributionGraph'

export default function UserProfilePage() {
  const params = useParams<{ username: string }>()
  const router = useRouter()
  const username = params?.username as string
  const { user } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'about' | 'links' | 'edit'>('overview')
  const isOwner = useMemo(() => profile && user && profile.id === user.id, [profile, user])
  const [form, setForm] = useState<Partial<Profile>>({})

  useEffect(() => {
    const load = async () => {
      if (!username) return
      setLoading(true)
      const p = await getProfileByUsername(username)
      if (!p) { router.push('/valley'); return }
      setProfile(p)
      const proj = await getProjects(p.id)
      setProjects(proj.filter(pr => pr.userId === p.id))
      setLoading(false)
    }
    load()
  }, [username])

  // Prepare edit form whenever profile changes
  useEffect(() => {
    if (!profile) return
    setForm({
      username: profile.username,
      fullName: profile.fullName,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      portfolioUrl: profile.portfolioUrl,
      skills: profile.skills || [],
      lookingForCollaboration: profile.lookingForCollaboration,
      creativePhilosophy: profile.creativePhilosophy,
    })
  }, [profile?.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-black dark:border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!profile) return null

  const saveProfile = async () => {
    if (!profile) return
    const updated = await updateProfile(profile.id, {
      fullName: form.fullName,
      bio: form.bio,
      location: form.location,
      website: form.website,
      portfolioUrl: form.portfolioUrl,
      skills: form.skills || [],
      lookingForCollaboration: !!form.lookingForCollaboration,
      username: form.username,
      creativePhilosophy: form.creativePhilosophy,
    } as Profile)
    if (updated) {
      setProfile(updated)
      setActiveTab('overview')
      // If username changed, update the URL to the new profile path
      if (updated.username && updated.username !== username) {
        router.replace(`/u/${updated.username}`)
      }
    }
  }

  const renderEmbeds = () => {
    const urls = [profile.website, profile.portfolioUrl].filter(Boolean) as string[]
    if (urls.length === 0) return <div className="text-sm text-neutral-400 uppercase tracking-widest">No links added yet</div>
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {urls.map((u, i) => {
          const url = u.toLowerCase()
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const idMatch = url.match(/[?&]v=([^&]+)/) || url.match(/youtu.be\/(.*)$/)
            const vid = idMatch ? idMatch[1] : ''
            return (
              <div key={i} className="aspect-video bg-neutral-100 dark:bg-neutral-900">
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${vid}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            )
          }
          if (url.includes('figma.com')) {
            return (
              <div key={i} className="aspect-video bg-neutral-100 dark:bg-neutral-900">
                <iframe className="w-full h-full" src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(u)}`} allowFullScreen />
              </div>
            )
          }
          if (url.includes('spotify.com')) {
            return (
              <div key={i} className="aspect-video bg-neutral-100 dark:bg-neutral-900">
                <iframe className="w-full h-full" src={`https://open.spotify.com/embed${new URL(u).pathname}`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
              </div>
            )
          }
          return (
            <a key={i} href={u} target="_blank" className="text-xl font-light underline decoration-1 underline-offset-4 break-all hover:opacity-50 transition-opacity">{u}</a>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Back */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
        <Link href="/valley" className="pointer-events-auto text-xs font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity bg-background/80 backdrop-blur-sm px-4 py-2">
          ← Back to Valley
        </Link>
        {isOwner && activeTab !== 'edit' && (
          <button
            onClick={() => setActiveTab('edit')}
            className="pointer-events-auto text-xs font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity bg-background/80 backdrop-blur-sm px-4 py-2"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-12 pt-32 pb-20 space-y-32">
        {/* Hero Section - Typographic & Minimal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-6xl md:text-9xl font-bold uppercase tracking-tighter leading-none">
                  {profile.fullName || profile.username}
                </h1>
                {profile.lookingForCollaboration && (
                  <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-green-500 animate-pulse" title="Open to Collaboration" />
                )}
              </div>
              <p className="text-xl md:text-2xl font-light text-neutral-500 max-w-2xl">
                {profile.bio || 'No bio provided.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-8 text-xs uppercase tracking-[0.2em] font-medium">
              {profile.location && (
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" className="hover:underline decoration-1 underline-offset-4">
                  Website
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" className="hover:underline decoration-1 underline-offset-4">
                  Portfolio
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-end items-start lg:items-end space-y-8">
            {/* Stats or Manifesto Snippet */}
            <div className="text-right space-y-2">
              <div className="text-6xl font-light">{projects.length}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">Projects</div>
            </div>
          </div>
        </div>

        {/* Tabs - Minimal Text */}
        {activeTab !== 'edit' && (
          <div className="border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-12">
            {(['overview', 'about', 'links'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  'pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all',
                  activeTab === t
                    ? 'opacity-100 border-b-2 border-black dark:border-white'
                    : 'opacity-30 hover:opacity-100 border-transparent'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[40vh]">
          {activeTab === 'overview' && (
            <div className="space-y-24">



              {/* Creative Philosophy / Manifesto */}
              {profile.creativePhilosophy && (
                <div className="max-w-4xl">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-8">Creative Philosophy</h3>
                  <p className="text-3xl md:text-5xl font-light leading-tight">
                    {profile.creativePhilosophy}
                  </p>
                </div>
              )}

              {/* Daily Check-in Board */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">Daily Check-ins</h3>
                <ContributionGraph userId={profile.id} />
              </div>


              {/* Projects Grid - Magazine Style */}
              <div>
                <div className="flex items-baseline justify-between mb-12">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400">Selected Projects</h3>
                </div>

                {projects.length === 0 ? (
                  <div className="py-20 text-center text-neutral-400 font-light uppercase tracking-widest text-sm">No projects yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20">
                    {projects.map((p, i) => (
                      <div key={p.id} className={cn("group cursor-pointer space-y-6", i % 3 === 0 ? "md:col-span-2" : "")}>
                        <div className={cn("bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative transition-colors group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800", i % 3 === 0 ? "aspect-[21/9]" : "aspect-[4/3]")}>
                          {/* Placeholder for project cover - would normally use p.coverImageUrl */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                            <div className="text-9xl font-bold uppercase tracking-tighter">{p.name[0]}</div>
                          </div>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h4 className="text-2xl md:text-3xl font-medium uppercase tracking-tight group-hover:opacity-60 transition-opacity">
                              {p.name}
                            </h4>
                            <p className="text-sm text-neutral-500 max-w-md line-clamp-2">{p.description}</p>
                          </div>
                          <div className="text-xs uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                            {new Date(p.createdAt).getFullYear()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4 space-y-12">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((s, i) => (
                        <span key={i} className="px-3 py-1 border border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wider">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-400 text-sm italic">No skills listed</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">Location</h3>
                  <p className="text-xl font-light">{profile.location || 'Remote'}</p>
                </div>
              </div>

              <div className="md:col-span-8">
                <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-8">Bio</h3>
                <p className="text-xl md:text-2xl font-light leading-relaxed whitespace-pre-wrap">
                  {profile.bio || 'No bio provided.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-12">
              {renderEmbeds()}
            </div>
          )}

          {activeTab === 'edit' && isOwner && (
            <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border-b border-black dark:border-white pb-8">
                <h2 className="text-4xl font-bold uppercase tracking-tighter">Edit Profile</h2>
                <div className="flex gap-4">
                  <button onClick={() => setActiveTab('overview')} className="text-xs uppercase tracking-widest hover:opacity-50">Cancel</button>
                  <button onClick={saveProfile} className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-xs uppercase tracking-widest hover:opacity-80">Save Changes</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">Full Name</label>
                    <Input
                      value={form.fullName || ''}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      className="border-0 border-b border-neutral-200 dark:border-neutral-800 rounded-none px-0 text-xl font-medium focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">Username</label>
                    <Input
                      value={form.username || ''}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      className="border-0 border-b border-neutral-200 dark:border-neutral-800 rounded-none px-0 text-xl font-medium focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">Location</label>
                    <Input
                      value={form.location || ''}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      className="border-0 border-b border-neutral-200 dark:border-neutral-800 rounded-none px-0 text-xl font-medium focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">Website</label>
                    <Input
                      value={form.website || ''}
                      onChange={e => setForm({ ...form, website: e.target.value })}
                      className="border-0 border-b border-neutral-200 dark:border-neutral-800 rounded-none px-0 text-xl font-medium focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">Portfolio URL</label>
                    <Input
                      value={form.portfolioUrl || ''}
                      onChange={e => setForm({ ...form, portfolioUrl: e.target.value })}
                      className="border-0 border-b border-neutral-200 dark:border-neutral-800 rounded-none px-0 text-xl font-medium focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <input
                      id="collab"
                      type="checkbox"
                      checked={!!form.lookingForCollaboration}
                      onChange={e => setForm({ ...form, lookingForCollaboration: e.target.checked })}
                      className="w-5 h-5 rounded-none border-neutral-300 text-black focus:ring-black"
                    />
                    <label htmlFor="collab" className="text-sm uppercase tracking-widest cursor-pointer select-none">Open to collaboration</label>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">Bio</label>
                  <Textarea
                    value={form.bio || ''}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    className="border-0 border-b border-neutral-200 dark:border-neutral-800 rounded-none px-0 text-xl font-light min-h-[100px] resize-none focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-neutral-400">Creative Philosophy</label>
                  <Textarea
                    value={form.creativePhilosophy || ''}
                    onChange={e => setForm({ ...form, creativePhilosophy: e.target.value })}
                    placeholder="What drives your work?"
                    className="border-0 border-b border-neutral-200 dark:border-neutral-800 rounded-none px-0 text-2xl font-light min-h-[150px] resize-none focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-neutral-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
