'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Profile, Project } from '@/types'

export default function ProfileAbout({ profile, projects }: { profile: Profile, projects: Project[] }) {
  const active = projects.filter(p => p.status === 'active').length
  const planning = projects.filter(p => p.status === 'planning').length
  const completed = projects.filter(p => p.status === 'completed').length
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <div className="text-2xl font-bold">{active}</div>
              <div className="text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{planning}</div>
              <div className="text-muted-foreground">Planning</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{completed}</div>
              <div className="text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Skills & Interests</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s, i) => (
                <Badge key={i} variant="outline">{s}</Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No skills added yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
