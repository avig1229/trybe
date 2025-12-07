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
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navigationItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'valley' as View, label: 'Valley', icon: Mountain },
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
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-12 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Typographic */}
          <div className="flex items-center gap-12">
            <Link href="/" className="text-2xl font-bold tracking-tighter uppercase">
              TRYBE
            </Link>

            {/* Main Navigation - Minimal Text */}
            <div className="hidden md:flex items-center gap-8">
              {navigationItems.map((item) => {
                const isActive = currentView === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "text-xs font-medium tracking-[0.2em] uppercase transition-opacity hover:opacity-100",
                      isActive ? "opacity-100" : "opacity-40"
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="opacity-40 hover:opacity-100 transition-opacity">
              <Sun className="h-4 w-4 hidden dark:inline" strokeWidth={1.5} />
              <Moon className="h-4 w-4 dark:hidden" strokeWidth={1.5} />
            </button>

            {/* Create Button - Minimal */}
            <button className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
              <Plus className="h-3 w-3" />
              <span>Create</span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
              >
                <Avatar className="h-8 w-8 rounded-none">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="rounded-none bg-neutral-100 dark:bg-neutral-800 text-xs">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* User Dropdown Menu - Minimal */}
              {showUserMenu && (
                <div className="absolute right-0 mt-4 w-56 bg-background border border-neutral-200 dark:border-neutral-800 p-2 shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 mb-2">
                    <p className="text-sm font-medium truncate">{profile?.username || user?.email}</p>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1">Creator</p>
                  </div>

                  <button
                    className="w-full text-left px-4 py-2 text-xs uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    onClick={() => {
                      setShowUserMenu(false)
                      const uname = profile?.username || user?.email?.split('@')[0] || user?.id
                      router.push(`/u/${uname}`)
                    }}
                  >
                    Profile
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 text-xs uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Settings
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 text-xs uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-neutral-100 dark:border-neutral-800 py-4">
          <div className="flex items-center gap-6 overflow-x-auto">
            {navigationItems.map((item) => {
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "text-xs font-medium tracking-[0.2em] uppercase whitespace-nowrap transition-opacity",
                    isActive ? "opacity-100" : "opacity-40"
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

