const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupStorage() {
    console.log('Setting up Supabase storage...');

    // Read .env.local manually since we don't have dotenv
    let envContent = '';
    try {
        envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
    } catch (e) {
        console.error('Could not read .env.local');
        process.exit(1);
    }

    const env = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            env[key] = value;
        }
    });

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
        console.error('Please ensure you have the service role key to create storage buckets programmatically.');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const bucketName = 'project-files';

    console.log(`Checking bucket: ${bucketName}...`);

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        process.exit(1);
    }

    const bucketExists = buckets.some(b => b.name === bucketName);

    if (bucketExists) {
        console.log(`Bucket '${bucketName}' already exists.`);

        // Update public status if needed
        const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
            public: true,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['image/*', 'video/*', 'application/pdf', 'audio/*']
        });

        if (updateError) {
            console.error('Error updating bucket:', updateError);
        } else {
            console.log('Bucket updated successfully.');
        }
    } else {
        console.log(`Creating bucket '${bucketName}'...`);
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['image/*', 'video/*', 'application/pdf', 'audio/*']
        });

        if (error) {
            console.error('Error creating bucket:', error);
            process.exit(1);
        }
        console.log('Bucket created successfully:', data);
    }
}

setupStorage().catch(console.error);
