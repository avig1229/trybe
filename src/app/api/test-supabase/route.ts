import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Test the connection by querying the database
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: 'Database connection failed'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful!',
      data: data
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to connect to Supabase'
    }, { status: 500 })
  }
}
