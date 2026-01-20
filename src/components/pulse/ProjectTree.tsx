'use client'

import { useEffect, useRef } from 'react'
import { Project, Post, TreeConfig } from '@/types'

interface ProjectTreeProps {
    project: Project
    posts: Post[]
    theme?: 'amber' | 'green' | 'cga' | 'gameboy'
    onNodeClick?: (post: Post) => void
}

const DEFAULT_CONFIG: TreeConfig = {
    palette: 'green-phosphor',
    trunkStyle: 'solid',
    branchAngle: 0,
    foliage: 'orb',
    growthDirection: 'up'
}

export function ProjectTree({ project, posts, theme = 'amber', onNodeClick }: ProjectTreeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const config = project.treeConfig || project.user?.defaultTreeConfig || DEFAULT_CONFIG

    // Map Tailwind classes to hex for canvas rendering
    const getColorHex = (colorString: string) => {
        if (colorString.startsWith('#')) return colorString
        const mapping: Record<string, string> = {
            'bg-neutral-900': '#333333',
            'bg-red-500': '#ef4444',
            'bg-blue-500': '#3b82f6',
            'bg-green-500': '#22c55e',
            'bg-yellow-500': '#eab308',
            'bg-purple-500': '#a855f7',
            'bg-pink-500': '#ec4899',
            'bg-emerald-500': '#10b981',
            'bg-amber-500': '#f59e0b',
        }
        return mapping[colorString] || colorString || '#33ff33'
    }

    const treeColor = getColorHex(project.color !== 'bg-neutral-900' ? project.color : (project.user?.defaultTreeColor || '#33ff33'))

    const getThemePalette = (t: string, baseColor?: string) => {
        switch (t) {
            case 'amber': return { bg: 'transparent', text: '#ffb300', line: baseColor || '#cc8e00', node: baseColor || '#ffb300' }
            case 'green': return { bg: 'transparent', text: '#33ff33', line: baseColor || '#009900', node: baseColor || '#33ff33' }
            case 'cga': return { bg: 'transparent', text: '#ff55ff', line: '#55ffff', node: '#ffffff' }
            case 'gameboy': return { bg: 'transparent', text: '#0f380f', line: '#306230', node: '#8bac0f' }
            default: return { bg: 'transparent', text: '#666666', line: baseColor || '#333333', node: baseColor || '#333333' }
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const palette = getThemePalette(theme, treeColor)
        const dPR = window.devicePixelRatio || 1
        const scale = 2
        const w = 240
        const h = 480

        canvas.width = w * dPR
        canvas.height = h * dPR
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.save()
        ctx.scale(dPR / scale, dPR / scale)
        ctx.translate(w * scale / 2, h * scale - 40) // Start from bottom center

        // Draw Root Pedestal (Circuit/Pedestal look)
        ctx.strokeStyle = palette.line
        ctx.lineWidth = 1
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(-20, 0)
        ctx.lineTo(20, 0)
        ctx.moveTo(-15, 5)
        ctx.lineTo(15, 5)
        ctx.stroke()

        // Sort posts by date for trunk drawing - Include all relevant activity
        const updates = posts
            .filter(p => !p.parentPostId) // Main posts form the trunk
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        // Calculate "Withered" state (Broken Streak)
        const lastPost = posts.length > 0 ? new Date(posts[posts.length - 1].createdAt) : null
        const isWithered = lastPost ? (Date.now() - lastPost.getTime() > 48 * 60 * 60 * 1000) : false

        if (isWithered) {
            ctx.filter = 'grayscale(100%) opacity(0.5)'
        }

        // Draw Trunk (Connecting updates)
        if (updates.length > 0) {
            ctx.strokeStyle = palette.line
            ctx.lineWidth = 3
            if (config.trunkStyle === 'dotted') ctx.setLineDash([4, 6])
            if (config.trunkStyle === 'circuit') ctx.setLineDash([10, 2])

            ctx.beginPath()
            ctx.moveTo(0, 0)

            updates.forEach((post, i) => {
                const yPos = -(i + 1) * 60 // Grow upwards
                ctx.lineTo(0, yPos)
            })
            ctx.stroke()

            // Draw Branches & Nodes
            posts.forEach((post) => {
                const updateIndex = updates.findIndex(u => u.id === post.id || u.id === post.parentPostId)
                if (updateIndex === -1) return

                const yPos = -(updateIndex + 1) * 60
                const isSuggestion = !!post.parentPostId

                if (isSuggestion) {
                    // Horizontal branch
                    const xPos = post.id.charCodeAt(0) % 2 === 0 ? 40 : -40
                    ctx.strokeStyle = palette.line
                    ctx.lineWidth = 1
                    ctx.setLineDash([2, 2])
                    ctx.beginPath()
                    ctx.moveTo(0, yPos)
                    ctx.lineTo(xPos, yPos)
                    ctx.stroke()

                    // Suggestion Node
                    ctx.fillStyle = palette.text
                    ctx.beginPath()
                    ctx.arc(xPos, yPos, 4, 0, Math.PI * 2)
                    ctx.fill()
                } else {
                    // Main Trunk Node
                    ctx.fillStyle = palette.node
                    ctx.shadowBlur = isWithered ? 0 : 10
                    ctx.shadowColor = palette.node
                    ctx.beginPath()
                    ctx.arc(0, yPos, 6, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.shadowBlur = 0
                }
            })
        } else {
            // Render "Seed" state (Glowing Pulse)
            ctx.fillStyle = palette.node
            ctx.shadowBlur = isWithered ? 0 : 30
            ctx.shadowColor = palette.node

            // Core
            ctx.beginPath()
            ctx.arc(0, 0, 5, 0, Math.PI * 2)
            ctx.fill()

            // Growing Pulse Aura
            const time = Date.now() / 1000
            const pulseScale = 1 + Math.sin(time * 2) * 0.2

            ctx.lineWidth = 1
            ctx.strokeStyle = palette.line
            ctx.setLineDash([2, 4])
            ctx.beginPath()
            ctx.arc(0, 0, 15 * pulseScale, 0, Math.PI * 2)
            ctx.stroke()
        }

        // Add scanlines effect (less visible if withered)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.strokeStyle = isWithered ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.1)'
        ctx.lineWidth = 0.5
        ctx.setLineDash([])
        for (let i = 0; i < h * scale; i += 2) {
            ctx.beginPath()
            ctx.moveTo(0, i)
            ctx.lineTo(w * scale, i)
            ctx.stroke()
        }

        ctx.restore()
    }, [theme, project, posts, config, treeColor])

    const displayName = project.user?.username || project.userId.slice(0, 8)

    return (
        <div
            className="flex flex-col items-center group cursor-pointer relative"
            onClick={() => posts.length > 0 && onNodeClick?.(posts[posts.length - 1])}
        >
            {/* Targeting Frame Overlay */}
            <div className="absolute -inset-12 border border-white/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-transparent group-hover:border-inherit" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-transparent group-hover:border-inherit" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-transparent group-hover:border-inherit" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-transparent group-hover:border-inherit" />

                {/* ID Tag on Hover */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 overflow-hidden h-0 group-hover:h-4 px-2 bg-neutral-900 dark:bg-white text-white dark:text-black text-[8px] font-bold tracking-[0.2em] uppercase transition-all whitespace-nowrap">
                    SCOPE: {project.id.slice(0, 8)}
                </div>
            </div>

            <div className="mb-4 text-center ">
                <span className="text-[8px] uppercase tracking-[0.4em] opacity-40 block mb-1 group-hover:opacity-100 transition-opacity text-black dark:text-white">
                    @{displayName}
                </span>
                <h3 className="text-[10px] font-bold tracking-widest bg-emerald-500/5 dark:bg-white/5 px-3 py-1 border border-emerald-500/20 dark:border-white/10 group-hover:border-emerald-500/40 dark:group-hover:border-white/30 transition-colors"
                    style={{ color: treeColor }}>
                    {project.name.toUpperCase()}
                </h3>
            </div>
            <div className="relative">
                <canvas ref={canvasRef} className="image-render-pixelated opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                {/* Glow behind the tree base */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 blur-2xl rounded-full transition-all duration-500"
                    style={{ backgroundColor: `${treeColor}22` }} />
            </div>
        </div>
    )
}
