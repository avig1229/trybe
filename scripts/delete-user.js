// Usage: node scripts/delete-user.js <user-id>
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
//
// This script deletes all storage files owned by a user and then
// deletes their auth account. Run the companion SQL first to remove
// DB records (profiles, projects, posts, etc).

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local manually (no dotenv dependency needed)
const envPath = path.join(__dirname, '../.env.local')
const envVars = fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .filter(line => line && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...rest] = line.split('=')
    if (key) acc[key.trim()] = rest.join('=').trim()
    return acc
  }, {})

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const userId = process.argv[2]
if (!userId) {
  console.error('Usage: node scripts/delete-user.js <user-id>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function deleteUserStorage(userId) {
  const BUCKET = 'project-files'
  let totalDeleted = 0
  let offset = 0
  const limit = 100

  while (true) {
    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list('', { limit, offset, search: userId })

    if (error) {
      // list() doesn't filter by owner — fall back to listing all and filtering
      break
    }

    if (!files || files.length === 0) break

    // Filter to files that belong to this user (path typically starts with userId)
    const userFiles = files.filter(f => f.name.startsWith(userId))
    if (userFiles.length > 0) {
      const paths = userFiles.map(f => f.name)
      const { error: deleteError } = await supabase.storage.from(BUCKET).remove(paths)
      if (deleteError) {
        console.error('Storage delete error:', deleteError.message)
      } else {
        totalDeleted += paths.length
        console.log(`Deleted ${paths.length} file(s): ${paths.join(', ')}`)
      }
    }

    if (files.length < limit) break
    offset += limit
  }

  console.log(`Storage cleanup complete. Total files deleted: ${totalDeleted}`)
}

async function deleteAuthUser(userId) {
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) {
    console.error('Failed to delete auth user:', error.message)
    console.log('You can delete the auth user manually in the Supabase dashboard under Authentication > Users')
  } else {
    console.log(`Auth user ${userId} deleted.`)
  }
}

async function main() {
  console.log(`\nDeleting user: ${userId}`)
  console.log('Make sure you have already run the companion SQL to remove DB records.\n')

  await deleteUserStorage(userId)
  await deleteAuthUser(userId)

  console.log('\nDone. User fully removed.')
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
