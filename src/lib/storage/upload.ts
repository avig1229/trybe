/**
 * Storage upload utilities with progress tracking and error handling
 */

import { createClient } from '@/lib/supabase/client'
import { validateFile, FileMetadata } from './validation'

export interface UploadOptions {
  bucket: string
  path: string
  file: File
  onProgress?: (progress: number) => void
  validate?: boolean
}

export interface UploadResult {
  url: string
  path: string
  metadata?: FileMetadata
  error?: string
}

export interface ChunkedUploadOptions extends UploadOptions {
  chunkSize?: number // in bytes, default 5MB
}

/**
 * Generate file path for storage
 */
export function generateFilePath(
  userId: string,
  fileType: 'video' | 'document' | 'image' | 'audio',
  filename: string,
  projectId?: string,
  postId?: string
): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const extension = '.' + filename.split('.').pop()?.toLowerCase()
  const baseName = sanitizedFilename.replace(/\.[^/.]+$/, '')

  if (projectId) {
    // Project media: videos/{userId}/{projectId}/{timestamp}_{filename}
    return `${fileType}s/${userId}/${projectId}/${timestamp}_${baseName}${extension}`
  } else if (postId) {
    // Post media: posts/{userId}/{postId}/{timestamp}_{filename}
    return `posts/${userId}/${postId}/${timestamp}_${baseName}${extension}`
  } else {
    // General: {fileType}s/{userId}/{timestamp}_{filename}
    return `${fileType}s/${userId}/${timestamp}_${baseName}${extension}`
  }
}

/**
 * Upload file to Supabase Storage with validation
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { bucket, path, file, onProgress, validate = true } = options
  const supabase = createClient()

  // Validate file if requested
  if (validate) {
    const validation = await validateFile(file)
    if (!validation.isValid) {
      return {
        url: '',
        path: '',
        error: validation.error || 'File validation failed',
      }
    }
  }

  try {
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
        onUploadProgress: (progress: { loaded: number; total: number }) => {
          if (onProgress) {
            const percentage = (progress.loaded / progress.total) * 100
            onProgress(percentage)
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

    if (error) {
      console.error('Upload error:', error)
      return {
        url: '',
        path: '',
        error: error.message || 'Upload failed',
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    // Extract metadata if validation was performed
    let metadata: FileMetadata | undefined
    if (validate) {
      const validation = await validateFile(file)
      metadata = validation.metadata
    }

    return {
      url: urlData.publicUrl,
      path: data.path,
      metadata,
    }
  } catch (error) {
    console.error('Upload exception:', error)
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Upload file in chunks (for large files)
 */
export async function uploadFileChunked(
  options: ChunkedUploadOptions
): Promise<UploadResult> {
  const { file, chunkSize = 5 * 1024 * 1024, validate = true } = options

  // Validate file if requested
  if (validate) {
    const validation = await validateFile(file)
    if (!validation.isValid) {
      return {
        url: '',
        path: '',
        error: validation.error || 'File validation failed',
      }
    }
  }

  // For files smaller than chunk size, use regular upload
  if (file.size <= chunkSize) {
    return uploadFile(options)
  }

  try {
    // const totalChunks = Math.ceil(file.size / chunkSize)
    // const uploadedBytes = 0

    // Note: Supabase Storage doesn't natively support chunked uploads
    // This is a placeholder for future implementation or using a different approach
    // For now, we'll use the regular upload with progress tracking

    // Alternative: Use resumable uploads if Supabase supports it in the future
    // For now, fall back to regular upload
    console.warn('Chunked upload not fully implemented, using regular upload')
    return uploadFile(options)
  } catch (error) {
    console.error('Chunked upload exception:', error)
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  bucket: string,
  userId: string,
  options?: {
    projectId?: string
    postId?: string
    onProgress?: (fileIndex: number, progress: number) => void
    validate?: boolean
  }
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    // Determine file type for path generation
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    let fileType: 'video' | 'document' | 'image' | 'audio' = 'document'

    if (['.mp4', '.webm', '.mov', '.avi'].includes(extension)) {
      fileType = 'video'
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
      fileType = 'image'
    } else if (['.mp3', '.wav', '.ogg'].includes(extension)) {
      fileType = 'audio'
    }

    const path = generateFilePath(userId, fileType, file.name, options?.projectId, options?.postId)

    const result = await uploadFile({
      bucket,
      path,
      file,
      validate: options?.validate !== false,
      onProgress: (progress) => {
        if (options?.onProgress) {
          options.onProgress(i, progress)
        }
      },
    })

    results.push(result)
  }

  return results
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete exception:', error)
    return false
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(bucket: string, paths: string[]): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete exception:', error)
    return false
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  return data.publicUrl
}

/**
 * Check if file exists in storage
 */
export async function fileExists(bucket: string, path: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop(),
      })

    if (error) {
      return false
    }

    return data && data.length > 0
  } catch {
    return false
  }
}

