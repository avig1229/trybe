'use client'

import { useState, useEffect } from 'react'
import { Comment } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, MessageSquare, Send } from 'lucide-react'

interface CommentSectionProps {
    postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
    const { user, profile } = useAuth()
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchComments()
    }, [postId])

    const fetchComments = async () => {
        setLoading(true)
        try {
            // 1. Try with explicit joins first
            let { data, error } = await supabase
                .from('comments')
                .select('*, profiles!user_id(*)')
                .eq('post_id', postId)
                .order('created_at', { ascending: true })

            if (error) {
                const { data: dataAlt, error: errorAlt } = await supabase
                    .from('comments')
                    .select('*, profiles(*)')
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true })
                if (errorAlt) throw errorAlt
                data = dataAlt
            }

            if (data) {
                setComments(data.map(c => ({
                    ...c,
                    user: c.profiles ? {
                        id: c.profiles.id,
                        username: c.profiles.username,
                        fullName: c.profiles.full_name,
                        avatarUrl: c.profiles.avatar_url,
                    } : undefined
                })) || [])
            }
        } catch (error: any) {
            console.warn('Comment join failed, falling back to manual fetch:', error.message)
            try {
                const { data: commentData, error: commentError } = await supabase
                    .from('comments')
                    .select('*')
                    .eq('post_id', postId)
                    .order('created_at', { ascending: true })

                if (commentError) throw commentError

                if (commentData && commentData.length > 0) {
                    const userIds = Array.from(new Set(commentData.map(c => c.user_id)))
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('id', userIds)

                    const profileMap = new Map((profileData || []).map(p => [p.id, p]))
                    setComments(commentData.map(c => ({
                        ...c,
                        user: profileMap.get(c.user_id) ? {
                            id: profileMap.get(c.user_id).id,
                            username: profileMap.get(c.user_id).username,
                            fullName: profileMap.get(c.user_id).full_name,
                            avatarUrl: profileMap.get(c.user_id).avatar_url,
                        } : undefined
                    })))
                } else {
                    setComments([])
                }
            } catch (e) {
                console.error('Total failure fetching comments:', e)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!user || !newComment.trim() || submitting) return
        setSubmitting(true)
        try {
            // Remove the problematic select join that causes schema cache errors
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content: newComment.trim()
                })
                .select('*') // Just select the comment itself
                .single()

            if (error) {
                console.error('Supabase insert error details:', error)
                throw error
            }

            // Manually attach the current user's profile from context
            const newC: Comment = {
                ...data,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                user: profile ? {
                    id: profile.id,
                    username: profile.username,
                    avatarUrl: profile.avatarUrl,
                    fullName: profile.fullName
                } : undefined
            }

            setComments(prev => [...prev, newC])
            setNewComment('')
        } catch (error: any) {
            console.error('Error submitting comment:', JSON.stringify(error, null, 2))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 mt-12 pt-12 border-t border-white/10">
            <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 opacity-50" />
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Feedback Loop</h3>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin opacity-20" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500 italic text-sm">
                        No feedback yet. Be the first to start the loop.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0 overflow-hidden">
                                    {comment.user?.avatarUrl ? (
                                        <img src={comment.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500">
                                            {comment.user?.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                                            {comment.user?.username || 'Anonymous'}
                                        </span>
                                        <span className="text-[8px] text-neutral-500 tracking-tighter">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {user ? (
                <div className="space-y-4 pt-6">
                    <div className="relative group">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Leave your feedback..."
                            className="bg-neutral-900/50 border-white/10 rounded-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all min-h-[100px] resize-none text-sm placeholder:text-neutral-600 block w-full p-4"
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
                            <span className="text-[8px] uppercase tracking-widest opacity-30">ENTER_TO_SEND_DISABLED</span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!newComment.trim() || submitting}
                            className="bg-white text-black hover:bg-neutral-200 rounded-none uppercase text-[10px] tracking-widest h-10 px-8 transition-all hover:tracking-[0.2em]"
                        >
                            {submitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Send className="h-3 w-3" />
                                    <span>Send Feedback</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="p-8 bg-neutral-950 border border-white/5 text-center space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 italic font-bold">Authentication required to close the loop.</p>
                </div>
            )}
        </div>
    )
}
