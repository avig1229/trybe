import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugPosts() {
    // Get the first user found (or specific one if we knew the ID, but let's just list all daily_updates)
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('type', 'daily_update')
        .order('created_at', { ascending: false })
        .limit(5)

    if (error) {
        console.error('Error fetching posts:', error)
        return
    }

    console.log('Found daily_update posts:', posts)

    if (posts.length > 0) {
        console.log('First post created_at:', posts[0].created_at)
        const date = new Date(posts[0].created_at)
        console.log('Parsed date:', date.toString())
        console.log('ISO split:', posts[0].created_at.split('T')[0])
    } else {
        console.log('No daily_update posts found.')
    }
}

debugPosts()
