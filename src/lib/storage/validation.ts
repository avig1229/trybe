/**
 * File validation utilities for uploads
 * Includes video duration validation (30 seconds max)
 */

export interface FileValidationResult {
  isValid: boolean
  error?: string
  metadata?: FileMetadata
}

export interface FileMetadata {
  type: string
  size: number
  name: string
  duration?: number // For videos, in seconds
  width?: number // For videos/images
  height?: number // For videos/images
  mimeType: string
}

// File type configurations
export const FILE_TYPES = {
  video: {
    extensions: ['.mp4', '.webm', '.mov', '.avi'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    maxSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 30, // 30 seconds
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.md', '.zip', '.rar'],
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'application/zip', 'application/x-rar-compressed'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  audio: {
    extensions: ['.mp3', '.wav', '.ogg'],
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
} as const

/**
 * Get file type from file
 */
export function getFileType(file: File): 'video' | 'document' | 'image' | 'audio' | null {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  const mimeType = file.type.toLowerCase()

  for (const [type, config] of Object.entries(FILE_TYPES)) {
    if (
      (config.extensions as readonly string[]).includes(extension) ||
      config.mimeTypes.some(mt => mimeType.includes(mt.split('/')[1]))
    ) {
      return type as 'video' | 'document' | 'image' | 'audio'
    }
  }

  return null
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, fileType: 'video' | 'document' | 'image' | 'audio'): boolean {
  const config = FILE_TYPES[fileType]
  return file.size <= config.maxSize
}

/**
 * Get video duration from file (client-side)
 * Returns duration in seconds
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src)
      reject(new Error('Failed to load video metadata'))
    }

    video.src = URL.createObjectURL(file)
  })
}

/**
 * Get video dimensions
 */
export function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
      })
    }

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src)
      reject(new Error('Failed to load video metadata'))
    }

    video.src = URL.createObjectURL(file)
  })
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      window.URL.revokeObjectURL(img.src)
      resolve({
        width: img.width,
        height: img.height,
      })
    }

    img.onerror = () => {
      window.URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Extract file metadata
 */
export async function extractFileMetadata(file: File): Promise<FileMetadata> {
  const fileType = getFileType(file)
  const metadata: FileMetadata = {
    type: fileType || 'unknown',
    size: file.size,
    name: file.name,
    mimeType: file.type,
  }

  if (fileType === 'video') {
    try {
      const duration = await getVideoDuration(file)
      metadata.duration = duration

      try {
        const dimensions = await getVideoDimensions(file)
        metadata.width = dimensions.width
        metadata.height = dimensions.height
      } catch (error) {
        console.warn('Failed to get video dimensions:', error)
      }
    } catch (error) {
      console.warn('Failed to get video duration:', error)
    }
  } else if (fileType === 'image') {
    try {
      const dimensions = await getImageDimensions(file)
      metadata.width = dimensions.width
      metadata.height = dimensions.height
    } catch (error) {
      console.warn('Failed to get image dimensions:', error)
    }
  }

  return metadata
}

/**
 * Validate file (size, type, and duration for videos)
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
  // Check file type
  const fileType = getFileType(file)
  if (!fileType) {
    return {
      isValid: false,
      error: `Unsupported file type. Supported types: videos (${FILE_TYPES.video.extensions.join(', ')}), documents (${FILE_TYPES.document.extensions.join(', ')}), images (${FILE_TYPES.image.extensions.join(', ')}), audio (${FILE_TYPES.audio.extensions.join(', ')})`,
    }
  }

  // Check file size
  if (!validateFileSize(file, fileType)) {
    const maxSizeMB = FILE_TYPES[fileType].maxSize / (1024 * 1024)
    return {
      isValid: false,
      error: `File size exceeds maximum of ${maxSizeMB}MB for ${fileType} files`,
    }
  }

  // Extract metadata
  let metadata: FileMetadata
  try {
    metadata = await extractFileMetadata(file)
  } catch {
    return {
      isValid: false,
      error: 'Failed to extract file metadata',
    }
  }

  // For videos, check duration (30 seconds max)
  if (fileType === 'video') {
    if (metadata.duration === undefined) {
      return {
        isValid: false,
        error: 'Could not determine video duration. Please try another file.',
      }
    }

    if (metadata.duration > FILE_TYPES.video.maxDuration) {
      return {
        isValid: false,
        error: `Video duration exceeds maximum of ${FILE_TYPES.video.maxDuration} seconds. Your video is ${metadata.duration.toFixed(1)} seconds.`,
        metadata,
      }
    }

    if (metadata.duration <= 0) {
      return {
        isValid: false,
        error: 'Invalid video duration. Please check your video file.',
        metadata,
      }
    }
  }

  return {
    isValid: true,
    metadata,
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(1)
  return `${mins}m ${secs}s`
}

