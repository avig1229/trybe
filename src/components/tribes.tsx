'use client'

import { Tribe } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, LogOut, Settings, ArrowRight } from 'lucide-react'

interface TribesProps {
  tribes: Tribe[]
  onCreateTribe: () => void
  onJoinTribe: (tribeId: string) => void
  onLeaveTribe: (tribeId: string) => void
  onEditTribe: (tribe: Tribe) => void
  onViewTribe: (tribe: Tribe) => void
}

export function Tribes({
  tribes,
  onCreateTribe,
  onJoinTribe,
  onLeaveTribe,
  onEditTribe,
  onViewTribe
}: TribesProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tribes</h1>
          <p className="text-muted-foreground">Find your community and collaborate</p>
        </div>
        <Button onClick={onCreateTribe}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tribe
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tribes.map((tribe) => (
          <Card key={tribe.id} className="group hover:shadow-lg transition-all cursor-pointer" onClick={() => onViewTribe(tribe)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src={tribe.iconUrl} />
                    <AvatarFallback className="rounded-lg">{tribe.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{tribe.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{tribe.memberCount} members</span>
                    </div>
                  </div>
                </div>
                {tribe.isMember ? (
                  <Badge variant="secondary">Member</Badge>
                ) : (
                  <Badge variant="outline">Join</Badge>
                )}
              </div>
              <CardDescription className="mt-2 line-clamp-2">
                {tribe.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {tribe.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground group-hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewTribe(tribe)
                  }}
                >
                  View Tribe <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {tribe.isMember ? (
                  <div className="flex gap-1">
                    {tribe.userRole === 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditTribe(tribe)
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        onLeaveTribe(tribe.id)
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onJoinTribe(tribe.id)
                    }}
                  >
                    Join
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
