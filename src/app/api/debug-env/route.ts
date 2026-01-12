import { NextResponse } from 'next/server'

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return NextResponse.json({
        // Show if variables are set (without exposing full values)
        url: {
            isSet: !!supabaseUrl,
            prefix: supabaseUrl?.substring(0, 30) + '...',
            length: supabaseUrl?.length || 0,
        },
        anonKey: {
            isSet: !!supabaseKey,
            prefix: supabaseKey?.substring(0, 10) + '...',
            length: supabaseKey?.length || 0,
            startsWithEyJ: supabaseKey?.startsWith('eyJ') || false,
        },
        // Check for common issues
        issues: {
            keyHasQuotes: supabaseKey?.includes('"') || supabaseKey?.includes("'") || false,
            keyHasNewlines: supabaseKey?.includes('\n') || supabaseKey?.includes('\r') || false,
            keyHasSpaces: supabaseKey?.startsWith(' ') || supabaseKey?.endsWith(' ') || false,
        },
        timestamp: new Date().toISOString(),
    })
}
