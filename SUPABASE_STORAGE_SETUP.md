# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for video and document uploads in your Trybe application.

## 📋 Prerequisites

- Supabase project created
- Environment variables configured (`.env.local`):
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
  ```

## 🚀 Setup Steps

### Step 1: Run Storage Setup SQL

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** (in the left sidebar)

2. **Run the Storage Setup Script**
   - Open the `storage-setup.sql` file from your project
   - Copy the entire contents
   - Paste it into the SQL Editor
   - Click **Run** (or press `Ctrl/Cmd + Enter`)

   This will:
   - ✅ Create 4 storage buckets (`avatars`, `project-media`, `tribe-media`, `post-media`)
   - ✅ Set up Row Level Security (RLS) policies
   - ✅ Create helper functions for file path generation

3. **Verify Execution**
   - You should see "Success. No rows returned" or similar success message
   - If you see errors about existing buckets, that's okay - the script uses `ON CONFLICT DO NOTHING`

### Step 2: Configure Bucket File Size Limits (Optional but Recommended)

1. **Navigate to Storage**
   - In Supabase Dashboard, go to **Storage** (left sidebar)
   - You should see the 4 buckets created:
     - `avatars`
     - `project-media`
     - `tribe-media`
     - `post-media`

2. **Set File Size Limits for Each Bucket**
   
   For each bucket, click on it and configure:
   
   **`project-media` bucket:**
   - Click on `project-media`
   - Go to **Settings** tab
   - Set **File size limit** to `104857600` (100 MB) - for videos
   - Click **Save**
   
   **`post-media` bucket:**
   - Click on `post-media`
   - Go to **Settings** tab
   - Set **File size limit** to `104857600` (100 MB) - for videos
   - Click **Save**
   
   **`avatars` bucket:**
   - Click on `avatars`
   - Go to **Settings** tab
   - Set **File size limit** to `5242880` (5 MB) - for images
   - Click **Save**
   
   **`tribe-media` bucket:**
   - Click on `tribe-media`
   - Go to **Settings** tab
   - Set **File size limit** to `104857600` (100 MB)
   - Click **Save**

### Step 3: Verify RLS Policies

1. **Check Storage Policies**
   - In Supabase Dashboard, go to **Storage** → **Policies**
   - You should see policies for each bucket:
     - Avatar policies (4 policies: SELECT, INSERT, UPDATE, DELETE)
     - Project media policies (4 policies)
     - Post media policies (4 policies)
     - Tribe media policies (4 policies)

2. **Verify Policy Details**
   - Click on a policy to view its definition
   - Policies should enforce that users can only access their own files
   - All files should be publicly readable (for sharing)

### Step 4: Test the Setup

1. **Test Bucket Creation**
   - In Storage, verify all 4 buckets exist
   - Each bucket should be marked as **Public**

2. **Test File Upload (Optional)**
   - You can manually upload a test file to verify permissions
   - Or wait until you test through the application

## 🔍 Troubleshooting

### Issue: "Bucket already exists" error
**Solution:** This is normal if you've run the script before. The script uses `ON CONFLICT DO NOTHING`, so existing buckets won't be recreated.

### Issue: "Policy already exists" error
**Solution:** 
1. Go to **Storage** → **Policies**
2. Find the conflicting policy
3. Delete it manually
4. Re-run the SQL script

Or modify the SQL script to use:
```sql
DROP POLICY IF EXISTS "policy_name" ON storage.objects;
```
before creating each policy.

### Issue: "Permission denied" when uploading
**Solution:** 
1. Check that RLS policies are correctly set up
2. Verify the user is authenticated
3. Check that the file path structure matches the policy expectations:
   - Project media: `{fileType}s/{userId}/{projectId}/{filename}`
   - Post media: `posts/{userId}/{postId}/{filename}`
   - Avatars: `{userId}/{filename}`

### Issue: Files not accessible publicly
**Solution:**
1. Verify buckets are marked as **Public** in Storage settings
2. Check that SELECT policies allow public access
3. Verify the file URL format is correct

## 📝 File Path Structure

The storage utilities create files with these path structures:

- **Project Media**: `videos/{userId}/{projectId}/{timestamp}_{filename}`
- **Post Media**: `posts/{userId}/{postId}/{timestamp}_{filename}`
- **Documents**: `documents/{userId}/{projectId}/{timestamp}_{filename}`
- **Images**: `images/{userId}/{projectId}/{timestamp}_{filename}`
- **Avatars**: `{userId}/{timestamp}_{filename}`

## ✅ Verification Checklist

After setup, verify:

- [ ] All 4 buckets exist in Storage
- [ ] All buckets are marked as Public
- [ ] File size limits are configured (100MB for media, 5MB for avatars)
- [ ] RLS policies are created for all buckets
- [ ] Policies allow users to upload their own files
- [ ] Policies allow public read access
- [ ] Helper functions are created (check in SQL Editor → Functions)

## 🔐 Security Notes

1. **RLS Policies**: All policies enforce that users can only modify their own files
2. **Public Access**: Files are publicly readable for sharing, but only the owner can modify/delete
3. **File Validation**: Client-side validation (30-second video limit) is enforced before upload
4. **File Size Limits**: Configured at the bucket level to prevent abuse

## 🎯 Next Steps

Once setup is complete:

1. Test file uploads through your application
2. Verify video duration validation (30 seconds max)
3. Test file access permissions
4. Check that files are accessible via public URLs

## 📚 Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Setup SQL File](./storage-setup.sql)

## 💡 Quick Reference

**Bucket Names:**
- `avatars` - User profile pictures (5MB limit)
- `project-media` - Project videos, documents, images (100MB limit)
- `post-media` - Post videos and media (100MB limit)
- `tribe-media` - Tribe media (100MB limit)

**File Limits:**
- Videos: 30 seconds max duration, 100MB max size
- Documents: 50MB max size
- Images: 20MB max size
- Audio: 100MB max size

**Important:** The 30-second video duration limit is enforced **client-side** in your application code, not in Supabase. Supabase will accept any video file, but your application will reject videos longer than 30 seconds before upload.

