'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Project } from '@/types'
import { getProjects, getUserProjects, createPost } from '@/lib/supabase/queries'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UploadResult, uploadFile } from '@/lib/storage/upload'
import { Loader2, Lock, AlertCircle, Upload, CheckCircle2 } from 'lucide-react'

export default function DailyCheckIn({ onUnlock }: { onUnlock: () => void }) {
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isFirstTime = searchParams.get('firstTime') === 'true'
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoPreview, setVideoPreview] = useState<string | null>(null)
    const [duration, setDuration] = useState<number>(0)
    const [error, setError] = useState<string | null>(null)

    // Background upload state
    const [uploadProgress, setUploadProgress] = useState(0)
    const [backgroundUploadComplete, setBackgroundUploadComplete] = useState<UploadResult | null>(null)
    const uploadPromiseRef = useRef<Promise<UploadResult> | null>(null)

    // New fields
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        const loadProjects = async () => {
            if (!user) return
            try {
                console.log('DailyCheckIn: Loading projects for user', user.id)
                // Use getUserProjects to only show projects the user OWNS
                const data = await getUserProjects(user.id)
                setProjects(data.filter(p => p.status === 'active' || p.status === 'planning'))
                if (data.length > 0) {
                    setSelectedProjectId(data[0].id)
                }
            } catch (err) {
                console.error('DailyCheckIn: Failed to load projects', err)
                setError('Failed to load projects. Please try refreshing.')
            } finally {
                setLoading(false)
            }
        }
        loadProjects()
    }, [user])

    const startBackgroundUpload = (file: File) => {
        if (!user) return

        setUploadProgress(0)
        setBackgroundUploadComplete(null)

        const promise = uploadFile({
            bucket: 'project-files',
            path: `daily/${user.id}/${Date.now()}-${file.name}`,
            file: file,
            onProgress: (progress) => setUploadProgress(progress)
        })

        uploadPromiseRef.current = promise

        promise.then(result => {
            if (!result.error) {
                setBackgroundUploadComplete(result)
            }
        }).catch(err => {
            console.error('Background upload failed:', err)
        })
    }

    const handleFileSelect = (file: File) => {
        setError(null)
        if (file.type.indexOf('video') === -1) {
            setError('Please upload a video file.')
            return
        }

        // Create a temporary URL to check duration and preview
        const url = URL.createObjectURL(file)
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.onloadedmetadata = () => {
            // Don't revoke yet, we use it for preview
            setDuration(video.duration)
            setVideoFile(file)
            setVideoPreview(url)

            if (file.size > 50 * 1024 * 1024) {
                setError('Video is too large. Maximum 50MB.')
            } else if (video.duration < 13.5) {
                setError('Video is too short. Minimum 13.5 seconds.')
            } else if (video.duration > 26.5) {
                setError('Video is too long. Maximum 26.5 seconds.')
            } else {
                // Valid video, start background upload
                startBackgroundUpload(file)
            }
        }
        video.src = url
    }

    const handleUploadComplete = async (result: UploadResult) => {
        if (!user || !selectedProjectId) return

        try {
            await createPost({
                userId: user.id,
                projectId: selectedProjectId,
                type: 'daily_update',
                title: title || `Daily Update - ${new Date().toLocaleDateString()}`,
                content: description || 'Daily check-in completed.',
                mediaUrl: result.url,
                mediaType: 'video',
                isFeatured: false
            })

            // Refresh data and redirect
            router.refresh()
            router.push('/valley')
            onUnlock()
        } catch (err) {
            console.error('Failed to create daily post:', err)
            setError('Failed to save update. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const isValidDuration = duration >= 13.5 && duration <= 26.5
    const canPost = isValidDuration && videoFile && !uploading && title.trim()

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-500 overflow-y-auto">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* Left Column: Context & Form */}
                <div className="space-y-8 text-left">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <Lock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold uppercase tracking-tighter">
                                    {isFirstTime ? 'Elevator Pitch' : 'Daily Check-In'}
                                </h1>
                                <p className="text-sm font-light text-neutral-400">
                                    {isFirstTime
                                        ? 'Welcome! Upload a 15s (+/- 1.5s) video pitch for your project. This "LoCommit" will be featured as the preview for your project in the Forest to attract collaborators and feedback.'
                                        : 'Unlock your workspace. 15s (+/- 1.5s) update.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {isFirstTime && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-1000">
                            <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-white/40">The Usual Flow</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                                    <h4 className="text-sm font-bold uppercase italic">1. Daily Lock</h4>
                                    <p className="text-xs text-neutral-500">Every morning at 9 AM, your workspace locks. You must post a reel to see your project and others' updates.</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                                    <h4 className="text-sm font-bold uppercase italic">2. Focus in Valley</h4>
                                    <p className="text-xs text-neutral-500">Use Project Valley to structure your creative work into channels and blocks.</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                                    <h4 className="text-sm font-bold uppercase italic">3. Sync with Pulse</h4>
                                    <p className="text-xs text-neutral-500">Follow others, join tribes, and share your journey in the Collective Pulse.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6 bg-neutral-900/50 p-6 rounded-2xl border border-white/10">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-neutral-400">Project</label>
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="w-full bg-neutral-800 border-none rounded-lg p-3 text-sm focus:ring-1 focus:ring-white"
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-neutral-400">Update Title</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What did you achieve today?"
                                className="bg-neutral-800 border-none placeholder:text-neutral-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-neutral-400">Description (Optional)</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Briefly explain your progress..."
                                className="bg-neutral-800 border-none min-h-[100px] resize-none placeholder:text-neutral-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: The Reel (Upload/Preview) */}
                <div className="flex flex-col items-center">
                    <div className="relative w-[300px] aspect-[9/16] bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl group">
                        {!videoFile ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 hover:bg-neutral-800/50 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleFileSelect(file)
                                    }}
                                />
                                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs uppercase tracking-widest font-bold">{isFirstTime ? 'Upload Pitch' : 'Upload Reel'}</span>
                                <span className="text-[10px] mt-2 opacity-50">9:16 Vertical Video</span>
                                <span className="text-[10px] opacity-50">~15s Video Pitch</span>
                            </div>
                        ) : (
                            <>
                                <video
                                    src={videoPreview!}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    preload="metadata"
                                    playsInline
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

                                {/* Overlay Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${isValidDuration ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-xs font-medium">{duration.toFixed(1)}s</span>
                                        {uploadProgress > 0 && uploadProgress < 100 && (
                                            <span className="text-[10px] text-neutral-400 ml-2">
                                                Uploading: {Math.round(uploadProgress)}%
                                            </span>
                                        )}
                                        {backgroundUploadComplete && (
                                            <span className="text-[10px] text-green-400 ml-2 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Ready
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight line-clamp-2">{title || (isFirstTime ? 'Project Pitch' : 'Untitled Update')}</h3>
                                    <p className="text-xs text-neutral-300 line-clamp-2 mt-1">{description || 'No description'}</p>
                                </div>

                                {/* Change Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full px-3 py-1 text-xs backdrop-blur-sm"
                                    onClick={() => {
                                        setVideoFile(null)
                                        setVideoPreview(null)
                                        setDuration(0)
                                        setError(null)
                                        setUploadProgress(0)
                                        setBackgroundUploadComplete(null)
                                        uploadPromiseRef.current = null
                                    }}
                                >
                                    Change
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-500 text-xs bg-red-500/10 px-4 py-2 rounded-full">
                            <AlertCircle className="h-3 w-3" />
                            {error}
                        </div>
                    )}

                    {/* Post Button */}
                    <div className="mt-8 w-[300px]">
                        <Button
                            className="w-full bg-white text-black hover:bg-neutral-200 uppercase tracking-widest py-6 text-sm font-bold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!canPost}
                            onClick={async () => {
                                setUploading(true)
                                try {
                                    let result: UploadResult

                                    // Check if background upload is already done
                                    if (backgroundUploadComplete) {
                                        result = backgroundUploadComplete
                                    } else if (uploadPromiseRef.current) {
                                        // Wait for existing upload
                                        result = await uploadPromiseRef.current
                                    } else {
                                        // Start new upload (fallback)
                                        result = await uploadFile({
                                            bucket: 'project-files',
                                            path: `daily/${user!.id}/${Date.now()}-${videoFile!.name}`,
                                            file: videoFile!
                                        })
                                    }

                                    if (result.error) {
                                        throw new Error(result.error)
                                    }

                                    await handleUploadComplete(result)
                                } catch (e: any) {
                                    console.error('CheckIn Error:', e)
                                    setError(e.message || 'Upload failed.')
                                    setUploading(false)
                                }
                            }}
                        >
                            {uploading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Posting...</span>
                                </div>
                            ) : (
                                'Share Update'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
