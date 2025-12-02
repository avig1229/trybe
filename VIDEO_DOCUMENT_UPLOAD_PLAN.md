# Video & Document Upload Implementation Plan

## Overview
This document outlines the plan for implementing video and document upload capabilities in the Trybe platform. The implementation will support uploading videos for progress updates, documents for project resources, and various media types for blocks.

## Architecture

### Storage Structure
- **Videos**: Stored in `project-media` bucket under `videos/{userId}/{projectId}/` or `post-media` for Collective Pulse posts
- **Documents**: Stored in `project-media` bucket under `documents/{userId}/{projectId}/`
- **Thumbnails**: Generated thumbnails stored alongside videos in `thumbnails/{userId}/{projectId}/`

### File Types Supported
- **Videos**: MP4, WebM, MOV, AVI (max 30 seconds duration, max 100MB file size)
- **Documents**: PDF, DOC, DOCX, TXT, MD, ZIP, RAR (max 50MB)
- **Images**: JPEG, PNG, GIF, WebP (max 20MB)
- **Audio**: MP3, WAV, OGG (max 100MB)

## Implementation Phases

### Phase 1: Storage Infrastructure (Foundation)
1. **Enhance Storage Setup**
   - Update `storage-setup.sql` with comprehensive RLS policies
   - Add buckets for organized file storage
   - Create helper functions for file path generation
   - Set up proper permissions for file access

2. **Storage Utilities**
   - Create `src/lib/storage/upload.ts` with:
     - Chunked upload support for large files
     - Progress tracking
     - Retry logic for failed uploads
     - File validation (including 30-second video duration limit)
     - Metadata extraction (video duration, resolution)
     - Client-side video duration validation

### Phase 2: Upload Components
1. **Video Upload Component**
   - Preview before upload
   - Progress indicator
   - File size validation (max 100MB)
   - Video duration validation (max 30 seconds - enforced client-side)
   - Thumbnail generation (client-side or server-side)
   - Video metadata extraction (duration, resolution)
   - Clear error messages for duration violations

2. **Document Upload Component**
   - File type validation
   - Preview for images/PDFs
   - Icon display for non-previewable files
   - Multiple file upload support
   - Drag & drop functionality

3. **Enhanced File Upload Component**
   - Improve existing `FileUpload` component
   - Add progress tracking
   - Better error handling
   - Support for different upload contexts (block, post, project)

### Phase 3: API & Backend
1. **API Routes**
   - `/api/upload/video` - Handle video uploads
   - `/api/upload/document` - Handle document uploads
   - `/api/upload/thumbnail` - Generate thumbnails (if server-side)
   - File validation and security checks

2. **Database Integration**
   - Update Block creation to store file URLs and metadata
   - Update Post creation to handle video URLs and thumbnails
   - Store file metadata in JSONB fields

### Phase 4: UI Integration
1. **Block Creation**
   - Add video upload to block creation flow
   - Add document upload to block creation flow
   - Display uploaded files in block list
   - File preview and management

2. **Post Creation**
   - Add video upload to post creation (Collective Pulse)
   - Video preview in feed
   - Thumbnail display

3. **Project Resources**
   - Integrate file uploads into project detail page
   - Organize files by channel
   - File management (delete, replace, organize)

### Phase 5: File Management
1. **File Preview Components**
   - Video player component
   - PDF viewer
   - Image gallery
   - Document download

2. **File Operations**
   - Delete files (with cleanup)
   - Replace files
   - Organize files in channels
   - File search and filtering

## Technical Details

### File Upload Flow
1. User selects file(s)
2. Client-side validation (size, type, video duration - 30 sec max)
3. File preview (if applicable) with duration display for videos
4. Upload to Supabase Storage (with progress tracking)
5. Server-side validation (duration check as backup)
6. Store metadata in database
7. Return file URL to client

### Security Considerations
- File type validation (MIME type + extension)
- File size limits enforced
- RLS policies for access control
- Virus scanning (future enhancement)
- Rate limiting on uploads

### Performance Optimizations
- Chunked uploads for large files
- Client-side compression for images
- Lazy loading for file previews
- CDN for file delivery (Supabase Storage)
- Thumbnail generation for videos

## Database Schema Updates

### Blocks Table
- Already supports `metadata` JSONB field for file information
- Store: `fileUrl`, `fileSize`, `fileType`, `thumbnailUrl`, `duration` (for videos)

### Posts Table
- Already has `mediaUrl`, `mediaType`, `thumbnailUrl` fields
- Use these for video posts in Collective Pulse

## File Naming Convention
- Videos: `{timestamp}_{userId}_{filename}`
- Documents: `{timestamp}_{userId}_{filename}`
- Thumbnails: `{timestamp}_{userId}_{videoId}_thumb.jpg`

## Error Handling
- Network errors: Retry with exponential backoff
- File size errors: Clear error message to user
- File type errors: Suggest allowed types
- Storage errors: Log and notify user
- Upload cancellation: Clean up partial uploads

## User Experience
- Drag & drop upload zones
- Progress indicators for uploads
- Preview before final upload
- Quick file deletion
- File organization in channels
- Search and filter files

## Future Enhancements
- Video transcoding (multiple resolutions)
- Video streaming (HLS/DASH)
- Collaborative file editing
- File versioning
- Cloud storage integration (Google Drive, Dropbox)
- Automatic thumbnail generation server-side
- Video processing queue
- File analytics (views, downloads)

## Testing Strategy
- Unit tests for file validation
- Integration tests for upload flow
- E2E tests for user workflows
- Load testing for large file uploads
- Security testing for file access

## Implementation Order
1. Storage infrastructure and utilities
2. Upload components (video and document)
3. API routes and backend integration
4. UI integration (blocks and posts)
5. File management and preview
6. Polish and optimization

