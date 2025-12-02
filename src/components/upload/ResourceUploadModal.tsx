'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUploader } from './FileUploader'
import { UploadResult } from '@/lib/storage/upload'
import { BlockType } from '@/types'
import { createBlock } from '@/lib/supabase/queries'
import { Plus } from 'lucide-react'

interface ResourceUploadModalProps {
    projectId: string
    channelId: string // Resources are organized in channels
    userId: string
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export function ResourceUploadModal({
    projectId,
    channelId,
    userId,
    onSuccess,
    trigger
}: ResourceUploadModalProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'upload' | 'details'>('upload')
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<BlockType>('file')
    const [saving, setSaving] = useState(false)

    const handleUploadComplete = (result: UploadResult) => {
        setUploadResult(result)
        setTitle(result.metadata?.name || '')

        // Auto-detect type from metadata
        if (result.metadata?.type === 'video') setType('video')
        else if (result.metadata?.type === 'image') setType('image')
        else if (result.metadata?.type === 'audio') setType('audio')
        else setType('file')

        setStep('details')
    }

    const handleSubmit = async () => {
        if (!uploadResult) return

        setSaving(true)
        try {
            await createBlock({
                channelId,
                type,
                title,
                content: uploadResult.url, // For file blocks, content is the URL
                description,
                metadata: {
                    path: uploadResult.path,
                    ...uploadResult.metadata
                }
            })

            setOpen(false)
            resetForm()
            onSuccess?.()
        } catch (error) {
            console.error('Failed to create block:', error)
        } finally {
            setSaving(false)
        }
    }

    const resetForm = () => {
        setStep('upload')
        setUploadResult(null)
        setTitle('')
        setDescription('')
        setType('file')
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Resource</DialogTitle>
                    <DialogDescription>
                        Upload a file to add it to your project resources.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {step === 'upload' ? (
                        <FileUploader
                            userId={userId}
                            projectId={projectId}
                            bucket="project-files"
                            path={`projects/${projectId}`}
                            onUploadComplete={handleUploadComplete}
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Resource title"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={type} onValueChange={(v: string) => setType(v as BlockType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="file">File</SelectItem>
                                        <SelectItem value="image">Image</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="audio">Audio</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional description"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setStep('upload')}>
                                    Back
                                </Button>
                                <Button onClick={handleSubmit} disabled={!title || saving}>
                                    {saving ? 'Saving...' : 'Save Resource'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
