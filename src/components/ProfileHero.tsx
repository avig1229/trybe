'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Profile } from '@/types'
import { Globe, MapPin, Link as LinkIcon } from 'lucide-react'

export default function ProfileHero({ profile }: { profile: Profile }) {
  const initials = (profile.fullName || profile.username || 'U')[0]?.toUpperCase()
  return (
    <div className="rounded-xl bg-card shadow-md overflow-hidden">
      <div className="h-28 bg-gradient-to-r from-violet-600 to-fuchsia-500" />
      <div className="p-6 -mt-12 flex items-end gap-4">
        <div className="w-20 h-20 rounded-xl bg-background border shadow -mb-2 flex items-center justify-center text-xl font-bold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{profile.fullName || profile.username}</h1>
            {profile.lookingForCollaboration && (
              <Badge className="bg-emerald-600 text-white">Open to collaborate</Badge>
            )}
          </div>
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
            {profile.location && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" className="inline-flex items-center gap-1 hover:underline">
                <Globe className="h-3.5 w-3.5" />Website
              </a>
            )}
            {profile.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" className="inline-flex items-center gap-1 hover:underline">
                <LinkIcon className="h-3.5 w-3.5" />Portfolio
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
