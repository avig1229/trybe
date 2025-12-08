import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/valley'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user to create profile if needed
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        // Create profile if it doesn't exist
        if (!profile) {
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.user_metadata?.preferred_username || user.email?.split('@')[0],
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            })

          // New user! Redirect to their profile page
          const username = user.user_metadata?.preferred_username || user.email?.split('@')[0]
          return NextResponse.redirect(`${origin}/u/${username}`)
        }
      }
    }
  }

  // Existing user or error, redirect to default (valley)
  return NextResponse.redirect(`${origin}${redirectTo}`)
}
