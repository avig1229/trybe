'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

type Theme = 'amber' | 'green' | 'cga' | 'gameboy'

interface DemoNode {
    id: string
    x: number
    y: number
    type: 'update' | 'suggestion'
    label: string
}

interface DemoProject {
    id: string
    name: string
    color: string
    nodes: DemoNode[]
}

const MOCK_PROJECTS: DemoProject[] = [
    {
        id: 'p1',
        name: 'PROJ_1',
        color: '#0088ff',
        nodes: [
            { id: '1', x: 0, y: 350, type: 'update', label: 'Day 1' },
            { id: '2', x: 0, y: 280, type: 'update', label: 'Day 2' },
            { id: '3', x: 20, y: 280, type: 'suggestion', label: 'Critique' },
            { id: '4', x: 0, y: 200, type: 'update', label: 'Day 3' },
        ]
    },
    {
        id: 'p2',
        name: 'PROJ_2',
        color: '#ff4400',
        nodes: [
            { id: '5', x: 0, y: 360, type: 'update', label: 'Inception' },
            { id: '6', x: 0, y: 300, type: 'update', label: 'V1' },
            { id: '7', x: 25, y: 300, type: 'suggestion', label: 'Note' },
            { id: '8', x: 0, y: 220, type: 'update', label: 'V2' },
            { id: '9', x: 30, y: 220, type: 'suggestion', label: 'Branch' },
            { id: '10', x: 0, y: 150, type: 'update', label: 'V3 (TOP)' },
        ]
    },
    {
        id: 'p3',
        name: 'PROJ_3',
        color: '#ffcc00',
        nodes: [
            { id: '11', x: 0, y: 340, type: 'update', label: 'Setup' },
            { id: '12', x: -15, y: 340, type: 'suggestion', label: 'Hint' },
            { id: '13', x: 0, y: 250, type: 'update', label: 'Core' },
            { id: '14', x: 0, y: 180, type: 'update', label: 'Latest' },
        ]
    }
]

export default function PulseDemoPage() {
    const [theme, setTheme] = useState<Theme>('amber')
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
    const isDragging = useRef(false)
    const lastMousePos = useRef({ x: 0, y: 0 })

    const getThemePalette = (t: Theme, baseColor?: string) => {
        switch (t) {
            case 'amber': return { bg: '#1a1100', text: '#ffb300', line: baseColor || '#cc8e00', node: baseColor || '#ffb300' }
            case 'green': return { bg: '#001a00', text: '#33ff33', line: baseColor || '#009900', node: baseColor || '#33ff33' }
            case 'cga': return { bg: '#000000', text: '#ff55ff', line: baseColor || '#55ffff', node: baseColor || '#ffffff' }
            case 'gameboy': return { bg: '#8bac0f', text: '#0f380f', line: '#306230', node: '#306230' }
        }
    }

    const TreeCanvas = ({ project }: { project: DemoProject }) => {
        const canvasRef = useRef<HTMLCanvasElement>(null)

        useEffect(() => {
            const canvas = canvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const palette = getThemePalette(theme, project.color)
            const dPR = window.devicePixelRatio || 1
            const scale = 2
            const w = 220
            const h = 420

            canvas.width = w * dPR
            canvas.height = h * dPR
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`

            ctx.fillStyle = palette.bg
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.save()
            ctx.scale(dPR / scale, dPR / scale)
            ctx.translate(w * scale / 2, 0) // Center the trunk

            // Draw Trunk (Upward)
            ctx.strokeStyle = palette.line
            ctx.lineWidth = 2
            ctx.setLineDash(theme === 'gameboy' ? [] : [3, 5])

            const updates = project.nodes.filter(n => n.type === 'update').sort((a, b) => b.y - a.y)
            if (updates.length > 0) {
                ctx.beginPath()
                ctx.moveTo(0, updates[0].y * scale)
                ctx.lineTo(0, updates[updates.length - 1].y * scale)
                ctx.stroke()
            }

            // Draw Branches & Nodes
            project.nodes.forEach(node => {
                if (node.type === 'suggestion') {
                    ctx.beginPath()
                    ctx.moveTo(0, node.y * scale)
                    ctx.lineTo(node.x * scale, node.y * scale)
                    ctx.stroke()
                }

                ctx.fillStyle = node.type === 'update' ? palette.node : palette.text
                const size = (node.type === 'update' ? 6 : 4) * scale

                if (theme === 'cga') {
                    ctx.fillRect(node.x * scale - size / 2, node.y * scale - size / 2, size, size)
                } else {
                    ctx.beginPath()
                    ctx.arc(node.x * scale, node.y * scale, size / 2, 0, Math.PI * 2)
                    ctx.fill()
                }

                ctx.fillStyle = palette.text
                ctx.font = `${6 * scale}px "Courier New", monospace`
                const labelX = (node.x + (node.x >= 0 ? 8 : -35)) * scale
                ctx.fillText(node.label.toUpperCase(), labelX, (node.y + 2) * scale)
            })

            ctx.restore()
        }, [theme, project])

        return (
            <div className="flex-shrink-0 w-[220px] group select-none">
                <div className="text-center mb-4 transition-transform group-hover:-translate-y-1 duration-300">
                    <p className="text-[9px] opacity-30 mb-1 tracking-widest">MAP_NODE_{project.id.toUpperCase()}</p>
                    <h3 className="text-[11px] font-bold tracking-widest bg-white/5 py-1 px-3 border border-white/10 inline-block" style={{ color: project.color }}>
                        {project.name}
                    </h3>
                </div>
                <div className="border border-white/5 bg-neutral-900/40 p-3 overflow-hidden backdrop-blur-sm shadow-xl">
                    <canvas ref={canvasRef} className="w-full image-render-pixelated opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        )
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true
        lastMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return
        const dx = e.clientX - lastMousePos.current.x
        const dy = e.clientY - lastMousePos.current.y
        setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        lastMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
        isDragging.current = false
    }

    return (
        <div
            className="min-h-screen bg-black text-white p-8 space-y-12 font-mono overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div className="max-w-6xl mx-auto space-y-8 relative z-10 pointer-events-none">
                <header className="border-b border-white/5 pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/20 bg-clip-text text-transparent">THE FOREST</h1>
                        <p className="text-neutral-600 text-[10px] mt-2 uppercase tracking-[0.4em]">Spatial Discovery :: Upward Growth Engine</p>
                    </div>
                    <div className="flex gap-2 pointer-events-auto">
                        {(['amber', 'green', 'cga', 'gameboy'] as Theme[]).map(t => (
                            <Button
                                key={t}
                                variant={theme === t ? 'default' : 'outline'}
                                onClick={() => setTheme(t)}
                                className="uppercase text-[9px] h-7 rounded-none border-white/5 transition-all px-3 hover:bg-white hover:text-black"
                            >
                                {t}
                            </Button>
                        ))}
                    </div>
                </header>
            </div>

            <section className="fixed inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 w-[200vw] h-[200vh] flex items-center justify-center pointer-events-none"
                    style={{ transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px))` }}>

                    <div className="grid grid-cols-4 gap-20 p-40">
                        {MOCK_PROJECTS.map(project => (
                            <div key={project.id} className="pointer-events-auto">
                                <TreeCanvas project={project} />
                            </div>
                        ))}
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex-shrink-0 w-[220px] h-[450px] border border-dashed border-white/5 flex flex-col items-center justify-center opacity-5 mt-20 rounded-lg">
                                <div className="text-xl font-thin">+</div>
                                <p className="text-[7px] tracking-[0.3em] mt-3 uppercase opacity-50">Locked Seed</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-50 bg-[length:100%_2px,3px_100%]" />

                <div className="absolute bottom-8 right-8 text-[9px] uppercase tracking-widest opacity-20 pointer-events-none text-right">
                    Coordinate_System: [{panOffset.x}, {panOffset.y}]<br />
                    Engine: Techno_Forest_V3.0<br />
                    Renderer: Low_Rez_Canvas_Pixelated
                </div>
            </section>

            <section className="fixed bottom-8 left-8 max-w-sm z-10 pointer-events-none bg-black/80 backdrop-blur-md p-6 border border-white/5">
                <h2 className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3 underline decoration-white/20">Spatial Instruction</h2>
                <p className="text-[11px] text-neutral-400 leading-relaxed mb-4">
                    Click and drag the screen to navigate the "Forest". Trees grow <span className="text-white font-bold">UPWARDS</span> as the latest development climbs toward the top.
                </p>
                <div className="flex gap-4">
                    <div className="space-y-1">
                        <span className="block text-[8px] uppercase opacity-30">Pan</span>
                        <kbd className="px-2 py-0.5 border border-white/20 rounded-sm text-[9px]">L-MB</kbd>
                    </div>
                    <div className="space-y-1">
                        <span className="block text-[8px] uppercase opacity-30">Zoom</span>
                        <kbd className="px-2 py-0.5 border border-white/20 rounded-sm text-[9px]">Wheel</kbd>
                    </div>
                </div>
            </section>

            <style jsx global>{`
        .image-render-pixelated {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        canvas {
           transition: opacity 0.5s ease-in-out;
        }
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    )
}
