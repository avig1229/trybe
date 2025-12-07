import { createClient } from '@/lib/supabase/client'

export const TAIWAN_OFFSET = 8 // UTC+8

export async function getDailyLockStatus(userId: string): Promise<{ isLocked: boolean; lastResetTime: Date }> {
    // DEMO MODE: Always return locked to test the UI
    console.log('DEMO MODE: Daily Lock is forced ON')
    return { isLocked: true, lastResetTime: new Date() }

    /* REAL LOGIC COMMENTED OUT FOR DEMO
    const now = new Date()

    // Calculate current time in Taiwan
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    const taiwanTime = new Date(utc + (3600000 * TAIWAN_OFFSET))

    // Determine the last 9:00 PM in Taiwan time
    const lastReset = new Date(taiwanTime)
    lastReset.setHours(21, 0, 0, 0)

    // If it's currently before 9 PM in Taiwan, the "last reset" was yesterday at 9 PM
    if (taiwanTime.getHours() < 21) {
        lastReset.setDate(lastReset.getDate() - 1)
    }

    // Convert back to UTC for database query comparison
    // We need to subtract the offset to get back to UTC
    const lastResetUTC = new Date(lastReset.getTime() - (3600000 * TAIWAN_OFFSET))

    const supabase = createClient()

    // Check for any 'daily_update' post created after the last reset time
    const { data, error } = await supabase
        .from('posts')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('type', 'daily_update')
        .gt('created_at', lastResetUTC.toISOString())
        .limit(1)

    if (error) {
        console.error('Error checking lock status:', error)
        // Fail safe: if error, don't lock the user out, but log it
        return { isLocked: false, lastResetTime: lastResetUTC }
    }

    const hasUpdate = data && data.length > 0

    return {
        isLocked: !hasUpdate,
        lastResetTime: lastResetUTC
    }
    */
}
