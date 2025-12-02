'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File as FileIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { uploadFile, UploadResult } from '@/lib/storage/upload'
import { validateFile, formatFileSize } from '@/lib/storage/validation'

interface FileUploaderProps {
    onUploadComplete: (result: UploadResult) => void
    onUploadError?: (error: string) => void
    bucket?: string
    path?: string // Base path, filename will be appended
    userId: string
    projectId?: string
    postId?: string
    accept?: string
    maxSize?: number
    className?: string
}

export function FileUploader({
    onUploadComplete,
    onUploadError,
    bucket = 'project-files',
    path = '',
    userId,
    projectId,
    postId,
    accept,
    maxSize,
    className
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const validateAndSetFile = async (selectedFile: File) => {
        setError(null)
        setSuccess(false)

        // Custom size check if provided
        if (maxSize && selectedFile.size > maxSize) {
            setError(`File size exceeds ${formatFileSize(maxSize)}`)
            return
        }

        // Use shared validation
        const validation = await validateFile(selectedFile)
        if (!validation.isValid) {
            setError(validation.error || 'Invalid file')
            return
        }

        setFile(selectedFile)
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0])
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        setProgress(0)
        setError(null)

        try {
            // Determine file type for path generation if not handled by uploadFile internally
            // But uploadFile handles path generation if we use the helper, 
            // here we are using the raw uploadFile which expects a full path or we let it handle it?
            // Looking at upload.ts, uploadFile takes a path. 
            // We should probably use a higher level function or generate the path here.
            // Let's generate a path here similar to how uploadFiles does it, or just pass the directory.

            // Actually, let's use the generateFilePath from upload.ts if we can import it, 
            // but it's not exported in the interface I saw earlier? 
            // Wait, I saw generateFilePath exported in upload.ts in the previous turn.
            // Let's assume we need to generate it.

            const timestamp = Date.now()
            const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
            // If path is provided, use it as directory, otherwise root
            const fullPath = path
                ? `${path}/${timestamp}_${sanitizedFilename}`
                : `${userId}/${timestamp}_${sanitizedFilename}`

            const result = await uploadFile({
                bucket,
                path: fullPath,
                file,
                onProgress: (p) => setProgress(p),
                validate: true
            })

            if (result.error) {
                throw new Error(result.error)
            }

            setSuccess(true)
            onUploadComplete(result)

            // Reset after a delay? No, let the parent handle it or keep success state
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed'
            setError(msg)
            onUploadError?.(msg)
        } finally {
            setUploading(false)
        }
    }

    const clearFile = () => {
        setFile(null)
        setError(null)
        setSuccess(false)
        setProgress(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className={cn("w-full", className)}>
            {!file ? (
                <div
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                        error ? "border-red-500/50 bg-red-500/5" : ""
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept={accept}
                    />
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="p-3 bg-muted rounded-full">
                            <Upload className="h-6 w-6" />
                        </div>
                        <div className="text-sm font-medium">
                            Click to upload or drag and drop
                        </div>
                        <div className="text-xs">
                            {accept ? `Accepted formats: ${accept}` : 'All files accepted'}
                            {maxSize && ` (Max ${formatFileSize(maxSize)})`}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-muted rounded">
                                <FileIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                        </div>
                        {!uploading && !success && (
                            <Button variant="ghost" size="icon" onClick={clearFile}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {uploading && (
                        <div className="space-y-1">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Upload complete!</span>
                        </div>
                    )}

                    {!success && !uploading && (
                        <Button className="w-full" onClick={handleUpload}>
                            Upload File
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
