'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getProfile, createProfile } from '@/lib/supabase/queries'
import { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Use useMemo to ensure the client is stable, or just call the singleton creator once
  const supabase = useMemo(() => createClient(), [])

  const loadProfile = async (userId: string) => {
    try {
      let userProfile = await getProfile(userId)

      if (!userProfile) {
        // Create profile if it doesn't exist (use snake_case column names)
        // We need to fetch the user again to ensure we have the latest metadata if this is a new signup
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        await createProfile({
          id: userId,
          username: currentUser?.email?.split('@')[0] || 'user',
          full_name: (currentUser?.user_metadata?.full_name as string | undefined) || '',
          avatar_url: (currentUser?.user_metadata?.avatar_url as string | undefined) || null,
          looking_for_collaboration: false,
        } as unknown as Profile)

        // Re-fetch after creation
        userProfile = await getProfile(userId)
      }

      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        setUser(session?.user ?? null)

        if (session?.user) {
          // Add a timeout to profile loading to prevent hanging
          const profilePromise = loadProfile(session.user.id)
          const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000))

          await Promise.race([profilePromise, timeoutPromise])
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return

        try {
          setUser(session?.user ?? null)

          if (session?.user) {
            // Add a timeout to profile loading to prevent hanging
            const profilePromise = loadProfile(session.user.id)
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000))

            await Promise.race([profilePromise, timeoutPromise])
          } else {
            setProfile(null)
          }
        } catch (error) {
          console.error('Auth state change error:', error)
        } finally {
          if (mounted) {
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
