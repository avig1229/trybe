'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { setOnboardingCompleted } from '@/lib/supabase/queries'
import { LayoutDashboard, Mountain, Activity, Users, ArrowRight, Loader2 } from 'lucide-react'

const features = [
    {
        icon: LayoutDashboard,
        title: 'Dashboard',
        description: 'Your central hub for tracking progress across all active and upcoming projects.',
    },
    {
        icon: Mountain,
        title: 'Project Valley',
        description: 'The creative workspace where projects are born and structured into channels and blocks.',
    },
    {
        icon: Activity,
        title: 'Collective Pulse',
        description: "The community feed. Witness the ecosystem's output and get inspired by others.",
    },
    {
        icon: Users,
        title: 'Tribes',
        description: 'Specialized micro-communities. Find your circle and build deep connections.',
    },
]

export default function OnboardingGuide() {
    const { user, profile, loading: authLoading, refreshProfile } = useAuth()
    const router = useRouter()
    const [finishing, setFinishing] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
        }
    }, [user, authLoading, router])

    const handleFinish = async () => {
        if (!user) return
        setFinishing(true)
        const success = await setOnboardingCompleted(user.id)
        if (success) {
            await refreshProfile()
            router.push('/valley?firstTime=true')
        } else {
            setFinishing(false)
            // TODO: Show error
        }
    }

    if (authLoading || !user) return null

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full space-y-12"
            >
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase italic">
                        Navigating the Ecosystem
                    </h1>
                    <p className="text-neutral-400 font-light max-w-xl mx-auto">
                        Trybe is designed for focus. Here's a brief look at the core pillars of your new workspace.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="bg-neutral-900/50 p-8 rounded-3xl border border-neutral-800 text-left space-y-4 hover:border-white/20 transition-colors"
                        >
                            <div className="p-3 bg-white/10 rounded-2xl w-fit">
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight uppercase italic">{feature.title}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="pt-8"
                >
                    <Button
                        onClick={handleFinish}
                        disabled={finishing}
                        className="bg-white text-black hover:bg-neutral-200 px-12 py-8 text-lg font-bold uppercase tracking-widest rounded-full group"
                    >
                        {finishing ? (
                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                Enter Trybe <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </motion.div>
            </motion.div>

            <div className="fixed bottom-12 left-0 right-0 text-center">
                <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-600">
                    Step 3 of 3: Navigation
                </p>
            </div>
        </div>
    )
}
