/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// INSTRUCTIONS:
// 1. Run this script: node scripts/verify-upload.js
// 2. If it fails with "Missing keys", you need to manually set them below or ensure .env.local is readable.

async function verifyUpload() {
    console.log('Verifying Supabase upload...');

    // Try to read .env.local
    let env = {};
    try {
        const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            }
        });
    } catch (e) {
        console.log('Could not read .env.local automatically.');
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Use ANON key to test RLS

    if (!supabaseUrl || !supabaseKey) {
        console.error('Error: Missing Supabase keys.');
        console.error('Please ensure .env.local exists and contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        process.exit(1);
    }

    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // We need to sign in to test "authenticated" policy
    // But we don't have a user.
    // So we can only test if the bucket exists and is public (if we try to list).

    const bucketName = 'project-files';

    console.log(`Checking if bucket '${bucketName}' is accessible...`);

    // Try to list files (public policy should allow this)
    const { data, error } = await supabase.storage.from(bucketName).list();

    if (error) {
        console.error('Error accessing bucket:', error);
        if (error.message.includes('recursion')) {
            console.error('❌ INFINITE RECURSION DETECTED. The SQL fix has NOT been applied correctly.');
        } else if (error.message.includes('not found')) {
            console.error('❌ BUCKET NOT FOUND. Please create the bucket "project-files".');
        } else {
            console.error('❌ Access failed:', error.message);
        }
    } else {
        console.log('✅ Bucket is accessible! (List successful)');
        console.log('The RLS policy for viewing seems correct.');
        console.log('Note: To fully verify uploads, you must be signed in via the app.');
    }
}

verifyUpload().catch(console.error);
