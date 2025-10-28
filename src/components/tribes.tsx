'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Plus, 
  Users, 
  Search, 
  Filter,
  Calendar,
  Eye,
  EyeOff,
  Settings,
  Crown,
  Shield,
  User,
  ArrowRight,
  Hash
} from 'lucide-react'
import { Tribe, TribeRole } from '@/types'
import { cn } from '@/lib/utils'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [showJoinedOnly, setShowJoinedOnly] = useState(false)

  const filteredTribes = tribes.filter(tribe => {
    const matchesSearch = tribe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tribe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tribe.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesJoined = !showJoinedOnly || tribe.isMember
    return matchesSearch && matchesJoined
  })

  const getRoleIcon = (role: TribeRole) => {
    switch (role) {
      case 'admin': return Crown
      case 'moderator': return Shield
      default: return User
    }
  }

  const getRoleColor = (role: TribeRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'moderator': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const TribeCard = ({ tribe }: { tribe: Tribe }) => {
    const RoleIcon = tribe.userRole ? getRoleIcon(tribe.userRole) : User
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {tribe.iconUrl ? (
                    <img src={tribe.iconUrl} alt={tribe.name} className="w-8 h-8 rounded" />
                  ) : (
                    <Hash className="h-6 w-6 text-white" />
                  )}
                </div>
                {tribe.isMember && tribe.userRole && (
                  <div className="absolute -bottom-1 -right-1">
                    <Badge variant="secondary" className={cn("text-xs", getRoleColor(tribe.userRole))}>
                      <RoleIcon className="h-2 w-2 mr-1" />
                      {tribe.userRole}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {tribe.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {!tribe.isPublic && (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                    {tribe.isMember && (
                      <Badge variant="outline" className="text-xs">
                        Joined
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {tribe.memberCount} members
                  </span>
                  <span>•</span>
                  <span>Created {formatTimeAgo(tribe.createdAt)}</span>
                  {tribe.creator && (
                    <>
                      <span>•</span>
                      <span>by {tribe.creator.fullName || tribe.creator.username}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {tribe.isMember && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditTribe(tribe)
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <CardDescription className="line-clamp-2">
            {tribe.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Tags */}
          {tribe.tags && tribe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tribe.tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tribe.tags.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{tribe.tags.length - 5}
                </Badge>
              )}
            </div>
          )}

          {/* Rules Preview */}
          {tribe.rules && tribe.rules.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Community Guidelines</h4>
              <div className="space-y-1">
                {tribe.rules.slice(0, 2).map((rule, index) => (
                  <p key={index} className="text-xs text-muted-foreground line-clamp-1">
                    • {rule}
                  </p>
                ))}
                {tribe.rules.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{tribe.rules.length - 2} more guidelines
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {tribe.memberCount}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {tribe.postCount} posts
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onViewTribe(tribe)
              }}
            >
              View Tribe
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
            
            {!tribe.isMember ? (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onJoinTribe(tribe.id)
                }}
              >
                Join
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onLeaveTribe(tribe.id)
                }}
              >
                Leave
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tribes</h1>
          <p className="text-muted-foreground">
            Join specialized communities of creators with shared interests and values
          </p>
        </div>
        <Button onClick={onCreateTribe} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Tribe
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tribes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showJoinedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowJoinedOnly(!showJoinedOnly)}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Joined Only
          </Button>
        </div>
      </div>

      {/* Featured/Recommended Tribes */}
      {tribes.filter(t => t.isPublic && !t.isMember).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Discover Tribes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tribes.filter(t => t.isPublic && !t.isMember).slice(0, 3).map((tribe) => (
              <TribeCard key={tribe.id} tribe={tribe} />
            ))}
          </div>
        </div>
      )}

      {/* My Tribes */}
      {tribes.filter(t => t.isMember).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Tribes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tribes.filter(t => t.isMember).map((tribe) => (
              <TribeCard key={tribe.id} tribe={tribe} />
            ))}
          </div>
        </div>
      )}

      {/* All Tribes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Tribes</h2>
        
        {filteredTribes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No tribes found</CardTitle>
              <CardDescription className="mb-4">
                {searchQuery || showJoinedOnly
                  ? 'Try adjusting your search or filters'
                  : 'Create the first tribe to start building a community'
                }
              </CardDescription>
              {!searchQuery && !showJoinedOnly && (
                <Button onClick={onCreateTribe} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create the First Tribe
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTribes.map((tribe) => (
              <TribeCard key={tribe.id} tribe={tribe} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Tribes</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {tribes.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Public</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {tribes.filter(t => t.isPublic).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Joined</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {tribes.filter(t => t.isMember).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Total Members</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {tribes.reduce((sum, tribe) => sum + tribe.memberCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

