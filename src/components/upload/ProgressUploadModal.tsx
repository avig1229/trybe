import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileUploader } from './FileUploader'
import { UploadResult } from '@/lib/storage/upload'
import { createPost, updatePost } from '@/lib/supabase/queries'
import { Plus, Video, Pencil } from 'lucide-react'
import { Post } from '@/types'

interface ProgressUploadModalProps {
    projectId: string
    userId: string
    post?: Post
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export function ProgressUploadModal({
    projectId,
    userId,
    post,
    onSuccess,
    trigger
}: ProgressUploadModalProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'details' | 'upload'>('details')
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (post && open) {
            setTitle(post.title || '')
            setContent(post.content)
            if (post.mediaUrl) {
                setUploadResult({
                    url: post.mediaUrl,
                    path: '', // Not needed for display/update unless changing
                    metadata: {
                        name: post.mediaUrl.split('/').pop() || 'Existing File',
                        size: 0,
                        type: post.mediaType || 'image',
                        mimeType: post.mediaType === 'video' ? 'video/mp4' : 'image/jpeg' // Best guess fallback
                    }
                })
            }
        } else if (!post && open) {
            // Reset if opening in create mode
            resetForm()
        }
    }, [post, open])

    const handleUploadComplete = (result: UploadResult) => {
        setUploadResult(result)
    }

    const handleSubmit = async () => {
        setSaving(true)
        try {
            const postData = {
                userId,
                projectId,
                type: 'progress' as const,
                title,
                content,
                ...(uploadResult ? {
                    mediaUrl: uploadResult.url,
                    mediaType: uploadResult.metadata?.type || 'image',
                    thumbnailUrl: uploadResult.metadata?.type === 'video' ? undefined : uploadResult.url,
                } : {}),
                isFeatured: false
            }

            if (post) {
                await updatePost(post.id, postData)
            } else {
                await createPost(postData)
            }

            setOpen(false)
            resetForm()
            onSuccess?.()
        } catch (error) {
            console.error('Failed to save post:', error)
        } finally {
            setSaving(false)
        }
    }

    const resetForm = () => {
        setStep('details')
        setUploadResult(null)
        setTitle('')
        setContent('')
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant={post ? "ghost" : "default"}>
                        {post ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                        {post ? '' : 'New Update'}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{post ? 'Edit Update' : 'Share Progress'}</DialogTitle>
                    <DialogDescription>
                        {post ? 'Update your progress details.' : 'Share an update about your project. Attach a video or image to show your work.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What did you accomplish?"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Share more details about your progress..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Attachment (Optional)</label>
                            {uploadResult ? (
                                <div className="border rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded">
                                            <Video className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{uploadResult.metadata?.name || 'Uploaded File'}</p>
                                            <p className="text-xs text-muted-foreground">Ready to post</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setUploadResult(null)}>
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <FileUploader
                                    userId={userId}
                                    projectId={projectId}
                                    bucket="project-files"
                                    path={`posts/${projectId}`}
                                    onUploadComplete={handleUploadComplete}
                                    className="h-32"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={!title || !content || saving}>
                            {saving ? 'Saving...' : (post ? 'Update Post' : 'Post Update')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
