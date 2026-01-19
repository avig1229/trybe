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
    const config = project.treeConfig || DEFAULT_CONFIG

    const getThemePalette = (t: string, baseColor?: string) => {
        switch (t) {
            case 'amber': return { bg: 'transparent', text: '#ffb300', line: baseColor || '#cc8e00', node: baseColor || '#ffb300' }
            case 'green': return { bg: 'transparent', text: '#33ff33', line: baseColor || '#009900', node: baseColor || '#33ff33' }
            case 'cga': return { bg: 'transparent', text: '#ff55ff', line: baseColor || '#55ffff', node: baseColor || '#ffffff' }
            case 'gameboy': return { bg: 'transparent', text: '#0f380f', line: '#306230', node: '#306230' }
            default: return { bg: 'transparent', text: '#ffffff', line: baseColor || '#ffffff', node: baseColor || '#ffffff' }
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const palette = getThemePalette(theme, project.color)
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

        // Sort posts by date for trunk drawing - Include all relevant activity
        const updates = posts
            .filter(p => !p.parentPostId) // Main posts form the trunk
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

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
                    ctx.shadowBlur = 10
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
            ctx.shadowBlur = 30
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

        // Add scanlines effect to the whole tree
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'
        ctx.lineWidth = 0.5
        ctx.setLineDash([])
        for (let i = 0; i < h * scale; i += 2) {
            ctx.beginPath()
            ctx.moveTo(0, i)
            ctx.lineTo(w * scale, i)
            ctx.stroke()
        }

        ctx.restore()
    }, [theme, project, posts, config])

    return (
        <div
            className="flex flex-col items-center group cursor-pointer"
            onClick={() => posts.length > 0 && onNodeClick?.(posts[posts.length - 1])}
        >
            <div className="mb-4 text-center ">
                <span className="text-[8px] uppercase tracking-[0.4em] opacity-40 block mb-1">
                    {project.userId.slice(0, 8)}
                </span>
                <h3 className="text-[10px] font-bold tracking-widest bg-white/5 px-3 py-1 border border-white/10 group-hover:border-white/30 transition-colors"
                    style={{ color: project.color }}>
                    {project.name.toUpperCase()}
                </h3>
            </div>
            <div className="relative">
                <canvas ref={canvasRef} className="image-render-pixelated opacity-80 group-hover:opacity-100 transition-opacity" />
                {/* Glow behind the tree base */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/5 blur-2xl rounded-full" />
            </div>
        </div>
    )
}
