import { createClient } from '@/lib/supabase/client'
export const TAIWAN_OFFSET = 8 // UTC+8

export async function getDailyLockStatus(userId: string): Promise<{ isLocked: boolean; lastResetTime: Date }> {
    const now = new Date()

    // 9:00 AM Taiwan Time = 1:00 AM UTC
    const lastResetUTC = new Date(now)
    lastResetUTC.setUTCHours(1, 0, 0, 0)

    // If it's currently before 1 AM UTC (9 AM Taiwan), the reset was yesterday
    if (now.getUTCHours() < 1) {
        lastResetUTC.setUTCDate(lastResetUTC.getUTCDate() - 1)
    }

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
}
