# Storage Utilities

This directory contains utilities for file uploads, validation, and management in the Trybe application.

## Features

- ✅ File type validation (video, document, image, audio)
- ✅ File size validation
- ✅ **Video duration validation (30 seconds maximum)**
- ✅ Progress tracking for uploads
- ✅ Metadata extraction (duration, dimensions, etc.)
- ✅ Organized file path generation
- ✅ Error handling and retry logic

## Usage

### Basic File Upload with Validation

```typescript
import { uploadFile, validateFile, generateFilePath } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'

// 1. Validate file first (recommended)
const file = // ... File object from input
const validation = await validateFile(file)

if (!validation.isValid) {
  console.error(validation.error)
  return
}

// 2. Generate file path
const userId = 'user-id'
const projectId = 'project-id'
const path = generateFilePath(userId, 'video', file.name, projectId)

// 3. Upload file with progress tracking
const result = await uploadFile({
  bucket: 'project-media',
  path: path,
  file: file,
  validate: true, // Validate again during upload
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`)
  }
})

if (result.error) {
  console.error(result.error)
} else {
  console.log('Upload successful:', result.url)
  console.log('File metadata:', result.metadata)
}
```

### Video Upload with Duration Validation

```typescript
import { validateFile, uploadFile, generateFilePath, FILE_TYPES } from '@/lib/storage'

const file = // ... Video file from input

// Validate video (includes 30-second duration check)
const validation = await validateFile(file)

if (!validation.isValid) {
  if (validation.error?.includes('duration')) {
    // Video exceeds 30 seconds
    alert(`Video is too long. Maximum duration is ${FILE_TYPES.video.maxDuration} seconds.`)
  }
  return
}

// Check duration in metadata
if (validation.metadata?.duration) {
  console.log(`Video duration: ${validation.metadata.duration} seconds`)
  console.log(`Video resolution: ${validation.metadata.width}x${validation.metadata.height}`)
}

// Upload video
const path = generateFilePath(userId, 'video', file.name, projectId)
const result = await uploadFile({
  bucket: 'project-media',
  path: path,
  file: file,
  validate: true,
})
```

### Upload Multiple Files

```typescript
import { uploadFiles } from '@/lib/storage'

const files = // ... Array of File objects
const userId = 'user-id'
const projectId = 'project-id'

const results = await uploadFiles(files, 'project-media', userId, {
  projectId: projectId,
  validate: true,
  onProgress: (fileIndex, progress) => {
    console.log(`File ${fileIndex}: ${progress}%`)
  }
})

// Check results
results.forEach((result, index) => {
  if (result.error) {
    console.error(`File ${index} failed:`, result.error)
  } else {
    console.log(`File ${index} uploaded:`, result.url)
  }
})
```

### File Validation Only

```typescript
import { validateFile, formatFileSize, formatDuration } from '@/lib/storage'

const file = // ... File object

const validation = await validateFile(file)

if (validation.isValid && validation.metadata) {
  console.log('File type:', validation.metadata.type)
  console.log('File size:', formatFileSize(validation.metadata.size))
  
  if (validation.metadata.duration) {
    console.log('Video duration:', formatDuration(validation.metadata.duration))
  }
  
  if (validation.metadata.width && validation.metadata.height) {
    console.log('Dimensions:', `${validation.metadata.width}x${validation.metadata.height}`)
  }
}
```

### Delete Files

```typescript
import { deleteFile, deleteFiles } from '@/lib/storage'

// Delete single file
const success = await deleteFile('project-media', 'videos/user-id/project-id/file.mp4')

// Delete multiple files
const paths = ['path1', 'path2', 'path3']
const success = await deleteFiles('project-media', paths)
```

## File Types and Limits

### Videos
- **Extensions**: `.mp4`, `.webm`, `.mov`, `.avi`
- **Max Size**: 100MB
- **Max Duration**: **30 seconds** (enforced)
- **Metadata**: duration, width, height

### Documents
- **Extensions**: `.pdf`, `.doc`, `.docx`, `.txt`, `.md`, `.zip`, `.rar`
- **Max Size**: 50MB

### Images
- **Extensions**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Max Size**: 20MB
- **Metadata**: width, height

### Audio
- **Extensions**: `.mp3`, `.wav`, `.ogg`
- **Max Size**: 100MB

## Storage Buckets

- `project-media`: Videos, documents, and images for projects
- `post-media`: Videos and media for Collective Pulse posts
- `tribe-media`: Media for tribes
- `avatars`: User avatars

## File Path Structure

- **Project media**: `{fileType}s/{userId}/{projectId}/{timestamp}_{filename}`
- **Post media**: `posts/{userId}/{postId}/{timestamp}_{filename}`
- **General**: `{fileType}s/{userId}/{timestamp}_{filename}`

## Error Handling

All functions return detailed error messages:

```typescript
const validation = await validateFile(file)

if (!validation.isValid) {
  // validation.error contains a user-friendly error message
  switch (true) {
    case validation.error?.includes('duration'):
      // Video duration exceeded
      break
    case validation.error?.includes('size'):
      // File size exceeded
      break
    case validation.error?.includes('Unsupported'):
      // Unsupported file type
      break
  }
}
```

## Video Duration Validation

The 30-second video duration limit is enforced **client-side** using HTML5 video element metadata. This provides immediate feedback to users before upload.

```typescript
// Duration is checked automatically during validation
const validation = await validateFile(videoFile)

// validation.metadata.duration contains the duration in seconds
if (validation.metadata?.duration && validation.metadata.duration > 30) {
  // This should not happen if validation.isValid is true
  // But you can check manually if needed
}
```

## Notes

- Video duration validation requires the video file to be loaded in the browser
- Large files may take time to validate (metadata extraction)
- Progress tracking is available for uploads
- All file paths are sanitized to prevent security issues
- RLS policies are enforced on the Supabase storage buckets

