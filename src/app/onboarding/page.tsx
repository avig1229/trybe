'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Users, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

export default function OnboardingIntro() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        }
        if (!loading && profile?.onboardingCompleted) {
            router.push('/valley')
        }
    }, [user, profile, loading, router])

    if (loading || !user) return null

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl space-y-12"
            >
                <div className="space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8"
                    >
                        <Sparkles className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase italic">
                        Welcome to Trybe
                    </h1>
                    <p className="text-xl text-neutral-400 font-light leading-relaxed max-w-lg mx-auto">
                        A space built for creative flow, collaborative belonging, and consistency in your craft.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left py-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2 text-white">
                            <Zap className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest font-bold">Flow</span>
                        </div>
                        <p className="text-sm text-neutral-400">Structured workspaces designed to keep you in the zone.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2 text-white">
                            <Users className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest font-bold">Belonging</span>
                        </div>
                        <p className="text-sm text-neutral-400">Join specialized tribes and grow with like-minded creators.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2 text-white">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-widest font-bold">Impact</span>
                        </div>
                        <p className="text-sm text-neutral-400">Build in public and share your progress with the ecosystem.</p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="pt-8"
                >
                    <Button
                        onClick={() => router.push('/onboarding/project')}
                        className="bg-white text-black hover:bg-neutral-200 px-12 py-8 text-lg font-bold uppercase tracking-widest rounded-full group"
                    >
                        Get Started
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </motion.div>
            </motion.div>

            <div className="fixed bottom-12 left-0 right-0 text-center">
                <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-600">
                    Step 1 of 3: Introduction
                </p>
            </div>
        </div>
    )
}
