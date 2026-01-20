'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ForestViewportProps {
    children: React.ReactNode
    zoom?: number
}

export function ForestViewport({ children, zoom = 1.0 }: ForestViewportProps) {
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
        const dx = (e.clientX - lastMousePos.current.x) / zoom
        const dy = (e.clientY - lastMousePos.current.y) / zoom
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        lastMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Touch Support
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true)
        lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        const dx = (e.touches[0].clientX - lastMousePos.current.x) / zoom
        const dy = (e.touches[0].clientY - lastMousePos.current.y) / zoom
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
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
            className="relative w-full h-full bg-[var(--forest-bg)] overflow-hidden cursor-grab active:cursor-grabbing border-none transition-colors duration-1000"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            {/* Day/Night Tiled Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30"
                style={{
                    backgroundImage: `
                        linear-gradient(45deg, var(--forest-tile) 25%, transparent 25%),
                        linear-gradient(-45deg, var(--forest-tile) 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, var(--forest-tile) 75%),
                        linear-gradient(-45deg, transparent 75%, var(--forest-tile) 75%)
                    `,
                    backgroundSize: '100px 100px',
                    backgroundPosition: '0 0, 0 50px, 50px -50px, -50px 0px',
                    transform: `translate(${offset.x % 100}px, ${offset.y % 100}px)`
                }}
            />

            {/* The Garden Content */}
            <div
                className="absolute transition-transform duration-0 ease-linear origin-center"
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
                }}
            >
                {children}
            </div>

            {/* Coordinate HUD */}
            <div className="absolute top-4 right-4 text-[8px] font-mono opacity-50 pointer-events-none uppercase tracking-widest text-right text-emerald-100 dark:text-neutral-500">
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
