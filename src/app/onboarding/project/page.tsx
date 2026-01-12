'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createProject } from '@/lib/supabase/queries'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ArrowRight } from 'lucide-react'

export default function OnboardingProject() {
    const { user, profile, loading: authLoading } = useAuth()
    const router = useRouter()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
        }
    }, [user, authLoading, router])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !name.trim()) return

        setCreating(true)
        const project = await createProject({
            userId: user.id,
            name: name.trim(),
            description: description.trim(),
            status: 'active',
            isPublic: true,
            color: 'bg-neutral-900',
        })

        if (project) {
            router.push('/onboarding/guide')
        } else {
            setCreating(false)
            // TODO: Show error
        }
    }

    if (authLoading || !user) return null

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full space-y-12"
            >
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tighter uppercase italic">
                        Your First Project
                    </h1>
                    <p className="text-neutral-400 font-light">
                        Every journey starts with a single step. What are you building?
                    </p>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500">
                            Project Name
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. My Next Masterpiece"
                            required
                            className="bg-transparent border-0 border-b border-neutral-800 rounded-none px-0 text-2xl font-medium focus-visible:ring-0 focus-visible:border-white transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500">
                            Description (Optional)
                        </label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's the vision?"
                            className="bg-transparent border-0 border-b border-neutral-800 rounded-none px-0 min-h-[100px] resize-none focus-visible:ring-0 focus-visible:border-white transition-colors"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={!name.trim() || creating}
                        className="w-full bg-white text-black hover:bg-neutral-200 py-8 text-lg font-bold uppercase tracking-widest rounded-full group"
                    >
                        {creating ? (
                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </form>
            </motion.div>

            <div className="fixed bottom-12 left-0 right-0 text-center">
                <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-600">
                    Step 2 of 3: Creation
                </p>
            </div>
        </div>
    )
}
