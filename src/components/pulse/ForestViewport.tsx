'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ForestViewportProps {
    children: React.ReactNode
}

export function ForestViewport({ children }: ForestViewportProps) {
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const lastMousePos = useRef({ x: 0, y: 0 })
    const viewportRef = useRef<HTMLDivElement>(null)

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return // Only left click
        setIsDragging(true)
        lastMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        const dx = e.clientX - lastMousePos.current.x
        const dy = e.clientY - lastMousePos.current.y
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        lastMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Prevent browser's default drag-scroll behavior
    useEffect(() => {
        const preventDefault = (e: WheelEvent) => {
            // Potentially handle zoom here if needed
        }
        window.addEventListener('wheel', preventDefault, { passive: false })

        // Initial centering
        if (viewportRef.current) {
            const { width, height } = viewportRef.current.getBoundingClientRect()
            setOffset({
                x: width / 2 - 2000,
                y: height / 2 - 2000
            })
        }

        return () => window.removeEventListener('wheel', preventDefault)
    }, [])

    const recenter = () => {
        if (viewportRef.current) {
            const { width, height } = viewportRef.current.getBoundingClientRect()
            setOffset({
                x: width / 2 - 2000,
                y: height / 2 - 2000
            })
        }
    }

    return (
        <div
            ref={viewportRef}
            className="relative w-full h-[calc(100vh-120px)] bg-black overflow-hidden cursor-grab active:cursor-grabbing border border-white/5"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Grid Pattern Background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #444 1px, transparent 1px),
            linear-gradient(to bottom, #444 1px, transparent 1px)
          `,
                    backgroundSize: '100px 100px',
                    transform: `translate(${offset.x % 100}px, ${offset.y % 100}px)`
                }}
            />

            {/* The Garden Content */}
            <div
                className="absolute transition-transform duration-0 ease-linear"
                style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
            >
                {children}
            </div>

            {/* Coordinate HUD */}
            <div className="absolute top-4 right-4 text-[8px] font-mono opacity-30 pointer-events-none uppercase tracking-widest text-right">
                POS: [{Math.round(offset.x)}, {Math.round(offset.y)}]<br />
                FOREST_LINK: STABLE<br />
                SEEDS_LOADED: 100%<br />
                <button
                    onClick={recenter}
                    className="mt-2 pointer-events-auto hover:opacity-100 transition-opacity underline underline-offset-4"
                >
                    [RECENTER_VIEW]
                </button>
            </div>
        </div>
    )
}
