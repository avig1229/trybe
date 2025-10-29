'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Mountain, 
  Heart, 
  Users, 
  Search, 
  Bell, 
  Plus,
  User,
  LogOut,
  Settings,
  Sun,
  Moon
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { View } from '@/types'

interface NavigationProps {
  currentView: View
  onViewChange: (view: View) => void
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, profile, signOut } = useAuth() as any
  const pathname = usePathname()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navigationItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'valley' as View, label: 'Project Valley', icon: Mountain },
    { id: 'pulse' as View, label: 'Collective Pulse', icon: Heart },
    { id: 'tribes' as View, label: 'Tribes', icon: Users },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const toggleTheme = () => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const isDark = root.classList.contains('dark')
    root.classList.toggle('dark', !isDark)
    localStorage.setItem('theme', !isDark ? 'dark' : 'light')
  }

  // Hydrate theme on mount (client only) to avoid SSR mismatch
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const prefersDark = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
    const shouldDark = stored ? stored === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', shouldDark)
  }, [])

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Mountain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trybe
              </span>
            </Link>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "gap-2",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              <Sun className="h-4 w-4 hidden dark:inline" />
              <Moon className="h-4 w-4 dark:hidden" />
            </Button>

            {/* Create Button */}
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium">{user?.email}</p>
                      <p className="text-xs text-muted-foreground">Creator</p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setShowUserMenu(false)
                        const uname = profile?.username || user?.email?.split('@')[0] || user?.id
                        router.push(`/u/${uname}`)
                      }}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start gap-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "gap-2 whitespace-nowrap",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

