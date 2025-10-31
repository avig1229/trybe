'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProfileByUsername, getProjects, updateProfile } from '@/lib/supabase/queries'
import { Profile, Project } from '@/types'
import ProfileHero from '@/components/ProfileHero'
import ProfileAbout from '@/components/ProfileAbout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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
    })
  }, [profile?.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
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
    } as Profile)
    if (updated) {
      setProfile(updated)
      // If username changed, update the URL to the new profile path
      if (updated.username && updated.username !== username) {
        router.replace(`/u/${updated.username}`)
      }
    }
  }

  const renderEmbeds = () => {
    const urls = [profile.website, profile.portfolioUrl].filter(Boolean) as string[]
    if (urls.length === 0) return <div className="text-sm text-muted-foreground">No links added yet</div>
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {urls.map((u, i) => {
          const url = u.toLowerCase()
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const idMatch = url.match(/[?&]v=([^&]+)/) || url.match(/youtu.be\/(.*)$/)
            const vid = idMatch ? idMatch[1] : ''
            return (
              <div key={i} className="aspect-video">
                <iframe className="w-full h-full rounded-md" src={`https://www.youtube.com/embed/${vid}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            )
          }
          if (url.includes('figma.com')) {
            return (
              <div key={i} className="aspect-video">
                <iframe className="w-full h-full rounded-md" src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(u)}`} allowFullScreen />
              </div>
            )
          }
          if (url.includes('spotify.com')) {
            return (
              <div key={i} className="aspect-video">
                <iframe className="w-full h-full rounded-md" src={`https://open.spotify.com/embed${new URL(u).pathname}`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
              </div>
            )
          }
          return (
            <a key={i} href={u} target="_blank" className="text-sm underline break-all">{u}</a>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <ProfileHero profile={profile} />
      </div>

      {/* Local nav to jump back */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/valley" className="underline">Project Valley</Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">Profile</span>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex items-center gap-2">
        {(['overview','about','links'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={cn('px-4 py-2 text-sm font-medium border-b-2', activeTab===t ? 'border-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>{t[0].toUpperCase()+t.slice(1)}</button>
        ))}
        {isOwner && (
          <button onClick={() => setActiveTab('edit')} className={cn('ml-auto px-4 py-2 text-sm font-medium border-b-2', activeTab==='edit' ? 'border-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>Edit</button>
        )}
      </div>

      {activeTab === 'overview' && (
        <ProfileAbout profile={profile} projects={projects} />
      )}

      {activeTab === 'about' && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.creativePhilosophy || 'No creative statement yet.'}</div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'links' && (
        <Card>
          <CardHeader>
            <CardTitle>Links & Embeds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderEmbeds()}
          </CardContent>
        </Card>
      )}

      {activeTab === 'edit' && isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Username</label>
              <Input value={form.username || ''} onChange={e=>setForm({...form, username: e.target.value})} />
              <p className="text-xs text-muted-foreground mt-1">This will be used for your profile URL.</p>
            </div>
            <div>
              <label className="text-sm">Full name</label>
              <Input value={form.fullName || ''} onChange={e=>setForm({...form, fullName: e.target.value})} />
            </div>
            <div>
              <label className="text-sm">Location</label>
              <Input value={form.location || ''} onChange={e=>setForm({...form, location: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Bio</label>
              <Textarea value={form.bio || ''} onChange={e=>setForm({...form, bio: e.target.value})} />
            </div>
            <div>
              <label className="text-sm">Website</label>
              <Input value={form.website || ''} onChange={e=>setForm({...form, website: e.target.value})} />
            </div>
            <div>
              <label className="text-sm">Portfolio URL</label>
              <Input value={form.portfolioUrl || ''} onChange={e=>setForm({...form, portfolioUrl: e.target.value})} />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input id="collab" type="checkbox" checked={!!form.lookingForCollaboration} onChange={e=>setForm({...form, lookingForCollaboration: e.target.checked})} />
              <label htmlFor="collab" className="text-sm">Open to collaboration</label>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Link href="/valley"><Button variant="outline">Back to Valley</Button></Link>
              <Button onClick={saveProfile}>Save changes</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
