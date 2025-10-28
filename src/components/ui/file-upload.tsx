'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  File, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<string[]>
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
}

interface UploadedFile {
  file: File
  preview?: string
  uploading: boolean
  uploaded: boolean
  error?: string
  url?: string
}

export function FileUpload({ 
  onUpload, 
  accept = "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt", 
  multiple = false,
  maxSize = 10,
  className,
  disabled = false
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return

    const fileArray = Array.from(newFiles)
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        return false
      }
      return true
    })

    const newUploadedFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploading: false,
      uploaded: false
    }))

    if (multiple) {
      setFiles(prev => [...prev, ...newUploadedFiles])
    } else {
      setFiles(newUploadedFiles)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    const droppedFiles = e.dataTransfer.files
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const uploadFiles = async () => {
    const filesToUpload = files.filter(f => !f.uploaded && !f.uploading)
    
    if (filesToUpload.length === 0) return

    // Set uploading state
    setFiles(prev => prev.map(f => ({
      ...f,
      uploading: filesToUpload.some(ftu => ftu.file === f.file)
    })))

    try {
      const fileList = filesToUpload.map(f => f.file)
      const urls = await onUpload(fileList)
      
      // Update with success state
      setFiles(prev => prev.map(f => {
        const fileIndex = filesToUpload.findIndex(ftu => ftu.file === f.file)
        if (fileIndex !== -1) {
          return {
            ...f,
            uploading: false,
            uploaded: true,
            url: urls[fileIndex]
          }
        }
        return f
      }))
    } catch (error) {
      // Update with error state
      setFiles(prev => prev.map(f => {
        const fileIndex = filesToUpload.findIndex(ftu => ftu.file === f.file)
        if (fileIndex !== -1) {
          return {
            ...f,
            uploading: false,
            error: 'Upload failed'
          }
        }
        return f
      }))
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image
    if (file.type.startsWith('video/')) return Video
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {accept} • Max {maxSize}MB per file
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            Choose Files
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Selected Files</h4>
            <Button
              size="sm"
              onClick={uploadFiles}
              disabled={files.every(f => f.uploaded || f.uploading)}
            >
              Upload {files.filter(f => !f.uploaded && !f.uploading).length} files
            </Button>
          </div>
          
          <div className="space-y-2">
            {files.map((uploadedFile, index) => {
              const Icon = getFileIcon(uploadedFile.file)
              
              return (
                <Card key={index} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3">
                      {/* Preview or Icon */}
                      <div className="flex-shrink-0">
                        {uploadedFile.preview ? (
                          <img
                            src={uploadedFile.preview}
                            alt={uploadedFile.file.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedFile.file.size)}
                        </p>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center gap-2">
                        {uploadedFile.uploading && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {uploadedFile.uploaded && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {uploadedFile.error && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={uploadedFile.uploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

