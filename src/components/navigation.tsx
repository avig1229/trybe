'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Badge } from '@/components/ui/badge'
import {
  Activity,
  Mountain,
  Sun,
  Moon,
  Plus
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
    { id: 'pulse' as View, label: 'Forest', icon: Activity },
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
                      "text-xs font-bold tracking-[0.2em] uppercase transition-all px-2 py-1",
                      isActive ? "bg-black text-white dark:bg-white dark:text-black" : "opacity-50 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-3 w-3" />
                      {item.label}
                    </div>
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
                <Avatar className="h-8 w-8 rounded-none ring-1 ring-transparent hover:ring-current transition-all">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="rounded-none bg-neutral-100 dark:bg-neutral-900 text-xs font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* User Dropdown Menu - Minimal */}
              {showUserMenu && (
                <div className="absolute right-0 mt-4 w-56 bg-background border border-neutral-200 dark:border-neutral-800 p-0 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-sm font-bold truncate">{profile?.username || user?.email}</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Creator</p>
                  </div>

                  <button
                    className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover-invert transition-all"
                    onClick={() => {
                      setShowUserMenu(false)
                      const uname = profile?.username || user?.email?.split('@')[0] || user?.id
                      router.push(`/u/${uname}`)
                    }}
                  >
                    Profile
                  </button>

                  <button
                    className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest hover-invert transition-all"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Settings
                  </button>

                  <button
                    className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
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

