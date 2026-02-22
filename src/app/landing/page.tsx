'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Loader2, Mail, Lock, Activity, Mountain, Plus,
    HelpCircle, PanelLeftClose, Layers,
    Image as ImageIcon, FileText, Video, Link2,
    ArrowRight, Sun, Moon,
} from 'lucide-react'

/* ═══════════════════════════════════════
   ANIMATED HERO TREE (canvas)
   ═══════════════════════════════════════ */
function HeroTree() {
    const ref = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        const c = ref.current; if (!c) return
        const ctx = c.getContext('2d'); if (!ctx) return
        const dpr = window.devicePixelRatio || 1
        const w = 320, h = 480
        c.width = w * dpr; c.height = h * dpr
        c.style.width = `${w}px`; c.style.height = `${h}px`
        ctx.scale(dpr, dpr)
        let f = 0, id: number
        function draw() {
            if (!ctx) return
            ctx.clearRect(0, 0, w, h)
            const bx = w / 2, by = h - 50, n = 12, sp = 28
            // trunk
            ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 12
            ctx.strokeStyle = '#4ade80'
            ctx.lineWidth = 2; ctx.setLineDash([5, 4])
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - n * sp); ctx.stroke()
            ctx.setLineDash([]); ctx.shadowBlur = 0
            // nodes + branches
            for (let i = 0; i < n; i++) {
                const y = by - i * sp, p = Math.sin(f * 0.025 + i * 0.5) * 0.25 + 0.75
                ctx.fillStyle = `rgba(74, 222, 128, ${p})`
                ctx.beginPath(); ctx.arc(bx, y, 3, 0, Math.PI * 2); ctx.fill()
                if (i > 2 && i % 2 === 0) {
                    for (let b = 0; b < Math.min(i - 1, 3); b++) {
                        const s = b % 2 === 0 ? 1 : -1
                        const l = 18 + b * 7 + Math.sin(f * 0.018 + b) * 4
                        const ex = bx + Math.cos((Math.PI / 4 + b * 0.3) * s - Math.PI / 2) * l * s
                        const ey = y + Math.sin((Math.PI / 4 + b * 0.3) * s - Math.PI / 2) * l * 0.45
                        ctx.strokeStyle = `rgba(74, 222, 128, ${p * 0.5})`; ctx.lineWidth = 1
                        ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(ex, ey); ctx.stroke()
                        ctx.fillStyle = `rgba(74, 222, 128, ${p * 0.35})`
                        ctx.beginPath(); ctx.arc(ex, ey, 2, 0, Math.PI * 2); ctx.fill()
                    }
                }
            }
            // top glow
            const ty = by - n * sp, sp2 = Math.sin(f * 0.04) * 8 + 14
            ctx.shadowColor = '#4ade80'; ctx.shadowBlur = sp2
            ctx.fillStyle = `rgba(74, 222, 128, ${0.3 + Math.sin(f * 0.04) * 0.15})`
            ctx.beginPath(); ctx.arc(bx, ty - 12, 6, 0, Math.PI * 2); ctx.fill()
            ctx.shadowBlur = 0
            // roots
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.15)'; ctx.lineWidth = 0.8
            for (let r = 0; r < 5; r++) {
                const a = (Math.PI / 6) * (r - 2), rl = 25 + r * 8
                ctx.beginPath(); ctx.moveTo(bx, by)
                ctx.lineTo(bx + Math.cos(a + Math.PI / 2) * rl, by + Math.sin(a + Math.PI / 2) * rl * 0.35 + 8)
                ctx.stroke()
            }
            f++; id = requestAnimationFrame(draw)
        }
        draw(); return () => cancelAnimationFrame(id)
    }, [])
    return <canvas ref={ref} className="mx-auto opacity-80" />
}

/* ═══════════════════════════════════════
   MINI FOREST CANVAS
   ═══════════════════════════════════════ */
function MiniForest() {
    const ref = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        const c = ref.current; if (!c) return
        const ctx = c.getContext('2d'); if (!ctx) return
        const dpr = window.devicePixelRatio || 1
        const w = 700, h = 360
        c.width = w * dpr; c.height = h * dpr
        c.style.width = '100%'; c.style.height = `${h}px`
        ctx.scale(dpr, dpr)
        let f = 0, id: number
        const trees = Array.from({ length: 14 }, (_, i) => {
            const a = i * (Math.PI * (3 - Math.sqrt(5)))
            const r = 75 * Math.sqrt(i)
            return {
                x: w / 2 + Math.cos(a) * r, y: h / 2 + Math.sin(a) * r * 0.55,
                ht: Math.max(3, Math.floor(Math.random() * 9) + 2),
                br: Math.floor(Math.random() * 4), withered: i > 10, user: i < 2
            }
        })
        function draw() {
            if (!ctx) return; ctx.clearRect(0, 0, w, h)
            // forest floor (matches real ForestViewport checkered pattern)
            const ts = 28
            for (let tx = 0; tx < w / ts; tx++) for (let ty = 0; ty < h / ts; ty++) {
                ctx.fillStyle = (tx + ty) % 2 === 0 ? 'rgba(19, 26, 19, 0.8)' : 'rgba(26, 15, 8, 0.5)'
                ctx.fillRect(tx * ts, ty * ts, ts, ts)
            }
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.04)'; ctx.lineWidth = 0.5
            for (let gx = 0; gx < w; gx += ts) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke() }
            for (let gy = 0; gy < h; gy += ts) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke() }
            // trees
            trees.forEach((t, idx) => {
                const p = Math.sin(f * 0.02 + idx) * 0.12 + 0.88
                const nsp = 16, bx = t.x, by = t.y + 35
                if (t.withered) { ctx.globalAlpha = 0.25; ctx.filter = 'grayscale(100%)' }
                const hue = t.user ? 142 : (120 + idx * 8) % 160
                const c = `hsla(${hue}, 70%, 55%, ${p * (t.user ? 0.9 : 0.6)})`
                ctx.strokeStyle = c; ctx.lineWidth = t.user ? 2 : 1
                ctx.shadowColor = c; ctx.shadowBlur = t.user ? 10 : 4
                ctx.setLineDash(t.user ? [] : [3, 3])
                const top = by - t.ht * nsp
                ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, top); ctx.stroke()
                ctx.setLineDash([]); ctx.shadowBlur = 0
                for (let n = 0; n < t.ht; n++) {
                    const ny = by - n * nsp
                    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(bx, ny, t.user ? 2.5 : 1.5, 0, Math.PI * 2); ctx.fill()
                    if (n > 1 && n % 2 === 0 && t.br > 0) {
                        for (let b = 0; b < Math.min(t.br, 3); b++) {
                            const s = b % 2 === 0 ? 1 : -1
                            const bl = 10 + b * 4 + Math.sin(f * 0.012 + b + idx) * 2
                            const ex = bx + Math.cos((Math.PI / 5 + b * 0.2) * s - Math.PI / 2) * bl * s
                            const ey = ny + Math.sin((Math.PI / 5 + b * 0.2) * s - Math.PI / 2) * bl * 0.4
                            ctx.strokeStyle = `hsla(${hue}, 60%, 50%, ${p * 0.4})`; ctx.lineWidth = 0.7
                            ctx.beginPath(); ctx.moveTo(bx, ny); ctx.lineTo(ex, ey); ctx.stroke()
                        }
                    }
                }
                if (t.ht <= 3) {
                    ctx.shadowColor = c; ctx.shadowBlur = Math.sin(f * 0.03 + idx) * 6 + 8
                    ctx.fillStyle = `hsla(${hue}, 70%, 55%, 0.25)`; ctx.beginPath(); ctx.arc(bx, top - 5, 4, 0, Math.PI * 2); ctx.fill()
                    ctx.shadowBlur = 0
                }
                ctx.globalAlpha = 1; ctx.filter = 'none'
                if (t.user) {
                    ctx.fillStyle = 'rgba(74, 222, 128, 0.4)'; ctx.font = '7px monospace'; ctx.textAlign = 'center'
                    ctx.fillText(idx === 0 ? '@you' : '@creator_2', bx, by + 12)
                }
            })
            f++; id = requestAnimationFrame(draw)
        }
        draw(); return () => cancelAnimationFrame(id)
    }, [])
    return <canvas ref={ref} className="w-full" />
}

/* ═══════════════════════════════════════
   VALLEY DEMO (static replica)
   ═══════════════════════════════════════ */
function ValleyDemo() {
    const projects = [
        { name: 'NEON DREAMS', status: 'active', blocks: 24, channels: 4 },
        { name: 'ECO-LODGE CONCEPT', status: 'active', blocks: 18, channels: 3 },
        { name: 'SOUNDSCAPES', status: 'planning', blocks: 7, channels: 2 },
    ]
    const blocks = [
        { type: 'image', title: 'Moodboard Reference', bg: 'bg-emerald-950/40' },
        { type: 'video', title: 'Progress Day 12', bg: 'bg-amber-950/40' },
        { type: 'text', title: 'Product Brief v2', bg: 'bg-sky-950/40' },
        { type: 'link', title: 'Figma Prototype', bg: 'bg-violet-950/40' },
        { type: 'image', title: 'Typography Study', bg: 'bg-rose-950/40' },
        { type: 'video', title: 'User Interview #3', bg: 'bg-cyan-950/40' },
    ]
    const icons: Record<string, React.ReactNode> = {
        image: <ImageIcon className="h-3.5 w-3.5 text-emerald-400/60" />,
        video: <Video className="h-3.5 w-3.5 text-amber-400/60" />,
        text: <FileText className="h-3.5 w-3.5 text-sky-400/60" />,
        link: <Link2 className="h-3.5 w-3.5 text-violet-400/60" />,
    }
    const graph = [0, 1, 2, 0, 3, 4, 3, 2, 1, 0, 0, 1, 3, 4, 4, 3, 2, 1, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 1, 2, 3, 2, 4, 3, 2]

    return (
        <div className="border border-neutral-200 dark:border-neutral-800 bg-black text-white">
            {/* Nav replica */}
            <div className="h-12 border-b border-white/10 flex items-center px-6 gap-8">
                <span className="text-sm font-bold tracking-tighter uppercase">TRYBE</span>
                <div className="flex gap-6 ml-4">
                    {['FOREST', 'VALLEY'].map((t, i) => (
                        <span key={t} className={`text-[10px] font-bold tracking-[0.2em] uppercase cursor-default transition-all px-2 py-0.5 ${i === 1 ? 'bg-white text-black' : 'opacity-40'}`}>{t}</span>
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <Sun className="h-3.5 w-3.5 opacity-30" />
                    <span className="text-[10px] uppercase tracking-widest opacity-30 flex items-center gap-1"><Plus className="h-2.5 w-2.5" /> Create</span>
                    <div className="w-6 h-6 rounded-none bg-neutral-900 text-[10px] font-bold flex items-center justify-center ring-1 ring-white/15">A</div>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <div className="w-60 border-r border-white/10 p-5 space-y-8 hidden md:block">
                    {/* Welcome */}
                    <div className="p-3 bg-white/5 border border-white/10 space-y-1.5">
                        <h3 className="text-[9px] uppercase tracking-widest font-bold opacity-40 flex items-center gap-1.5">
                            <HelpCircle className="h-2.5 w-2.5" /> Welcome to the Valley
                        </h3>
                        <p className="text-[9px] leading-relaxed opacity-30">Your private creative sanctum. Organize your projects into channels and blocks.</p>
                    </div>
                    {/* Stats */}
                    <div className="space-y-1">
                        <h3 className="text-[9px] uppercase tracking-[0.15em] opacity-30 italic">Creator Stats</h3>
                        <p className="text-xl font-bold tracking-tighter">3 <span className="text-[9px] uppercase tracking-widest opacity-30 font-normal">Active Projects</span></p>
                    </div>
                    {/* Graph */}
                    <div className="space-y-2">
                        <h3 className="text-[9px] uppercase tracking-[0.15em] opacity-30 italic">Activity Tracker</h3>
                        <div className="flex gap-[2px] flex-wrap">
                            {graph.map((v, i) => (
                                <div key={i} className="w-[7px] h-[7px]" style={{ backgroundColor: `rgba(74, 222, 128, ${[0.05, 0.2, 0.4, 0.6, 0.9][v]})` }} />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end"><PanelLeftClose className="h-3.5 w-3.5 opacity-20" /></div>
                    {/* Project list */}
                    <div className="space-y-1.5">
                        {projects.map((p, i) => (
                            <div key={i} className={`p-2.5 border cursor-default transition-all ${i === 0 ? 'border-white/20 bg-white/5' : 'border-transparent'}`}>
                                <div className="text-[10px] uppercase tracking-[0.12em] font-bold">{p.name}</div>
                                <div className="flex gap-3 mt-1">
                                    <span className="text-[8px] uppercase tracking-widest opacity-25">{p.blocks} blocks</span>
                                    <span className="text-[8px] uppercase tracking-widest opacity-25">{p.channels} ch</span>
                                </div>
                                <span className={`inline-block mt-1 text-[7px] uppercase tracking-widest ${p.status === 'active' ? 'text-green-400/60' : 'text-yellow-400/40'}`}>{p.status}</span>
                            </div>
                        ))}
                        <button className="w-full p-2 border border-dashed border-white/15 text-[9px] uppercase tracking-widest opacity-25 flex items-center justify-center gap-1 hover:opacity-50 transition-opacity">
                            <Plus className="h-2.5 w-2.5" /> New Project
                        </button>
                    </div>
                </div>

                {/* Main */}
                <div className="flex-1 p-6 space-y-5">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold uppercase tracking-tighter">Neon Dreams</h2>
                        <p className="text-[10px] uppercase tracking-[0.2em] opacity-30">Visual identity &amp; branding exploration</p>
                    </div>
                    <div className="flex gap-4 border-b border-white/10 pb-2">
                        {['MOODBOARD', 'RESEARCH', 'DRAFTS', 'EXPORTS'].map((ch, i) => (
                            <span key={ch} className={`text-[9px] uppercase tracking-[0.12em] font-bold cursor-default pb-1 ${i === 0 ? 'border-b border-current opacity-100' : 'opacity-25'}`}>{ch}</span>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {blocks.map((b, i) => (
                            <div key={i} className={`border border-white/10 p-3 space-y-2 hover:border-white/25 transition-all cursor-default ${b.bg}`}>
                                <div className="aspect-[4/3] bg-white/5 flex items-center justify-center">{icons[b.type]}</div>
                                <div>
                                    <div className="text-[10px] font-medium">{b.title}</div>
                                    <div className="text-[8px] uppercase tracking-widest opacity-20 mt-0.5">{b.type}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════
   FOREST DEMO (replica)
   ═══════════════════════════════════════ */
function ForestDemo() {
    return (
        <div className="border border-neutral-200 dark:border-neutral-800 bg-black text-white">
            <div className="px-5 py-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Layers className="h-3.5 w-3.5 text-green-400/60" />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold opacity-50">THE FOREST</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="text-[10px] px-2 py-0.5 border border-white/15 opacity-40 hover:opacity-100 transition-all">−</button>
                    <span className="text-[10px] opacity-20 font-mono w-8 text-center">100%</span>
                    <button className="text-[10px] px-2 py-0.5 border border-white/15 opacity-40 hover:opacity-100 transition-all">+</button>
                </div>
            </div>
            <div className="relative bg-black">
                <MiniForest />
                <div className="absolute bottom-3 left-3 text-[8px] font-mono text-green-400/30 bg-black/70 px-2 py-1">
                    POS: 2000, 2000 &nbsp;|&nbsp; TREES: 14 &nbsp;|&nbsp; ZOOM: 1.0x
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════ */
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [v, setV] = useState(false)
    useEffect(() => {
        const el = ref.current; if (!el) return
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: 0.1 })
        obs.observe(el); return () => obs.disconnect()
    }, [])
    return (
        <div ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {children}
        </div>
    )
}


/* ═══════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════ */
export default function LandingPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignup, setIsSignup] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [isDark, setIsDark] = useState(true)

    // Theme helpers — outer page chrome only (demo panels stay dark)
    const bg = isDark ? 'bg-black' : 'bg-white'
    const fg = isDark ? 'text-white' : 'text-black'
    const navBg = isDark ? 'bg-black/80' : 'bg-white/80'
    const border = isDark ? 'border-white/10' : 'border-black/10'
    const borderFine = isDark ? 'border-white/15' : 'border-black/15'
    const muted = isDark ? 'text-white/60' : 'text-black/60'
    const subtle = isDark ? 'text-white/50' : 'text-black/50'
    const dimText = isDark ? 'text-white/40' : 'text-black/40'
    const faintText = isDark ? 'text-white/35' : 'text-black/35'
    const microText = isDark ? 'text-white/30' : 'text-black/30'
    const btnFill = isDark ? 'bg-white text-black' : 'bg-black text-white'
    const btnGhost = isDark ? 'border-white/20 hover:bg-white hover:text-black' : 'border-black/20 hover:bg-black hover:text-white'
    const gridGap = isDark ? 'bg-white/10' : 'bg-black/10'
    const cardHover = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.04]'
    const overlay = isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'
    const tagBg = isDark ? 'bg-black/50' : 'bg-white/70'
    const iconDim = isDark ? 'text-white/35' : 'text-black/35'
    const placeholder = isDark ? 'placeholder:text-white/25' : 'placeholder:text-black/25'
    const inputText = isDark ? 'text-white bg-transparent' : 'text-black bg-transparent'
    const focusBorder = isDark ? 'focus-visible:border-white' : 'focus-visible:border-black'
    const inactiveTab = isDark ? 'text-white/40 hover:text-white/70' : 'text-black/40 hover:text-black/70'

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault(); setIsLoading(true); setError(''); setMessage('')
        try {
            if (isSignup) {
                const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
                if (error) setError(error.message); else setMessage('Check your email to confirm your account.')
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) setError(error.message); else { router.push('/valley'); router.refresh() }
            }
        } catch { setError('An unexpected error occurred.') }
        finally { setIsLoading(false) }
    }

    const handleGoogle = async () => {
        setIsLoading(true)
        try { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } }) }
        catch { setError('Google sign-in failed.'); setIsLoading(false) }
    }

    return (
        <div className={`min-h-screen ${bg} ${fg} overflow-x-hidden transition-colors duration-300`}>
            {/* ─── NAV ─── */}
            <nav className={`fixed top-0 w-full z-50 ${navBg} backdrop-blur-md border-b ${border} transition-colors duration-300`}>
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                    <span className="text-2xl font-bold tracking-tighter uppercase">TRYBE</span>
                    <div className="hidden md:flex items-center gap-8">
                        {['Valley', 'LoCommit', 'Forest'].map(s => (
                            <a key={s} href={`#${s.toLowerCase()}`} className="text-xs font-bold tracking-[0.2em] uppercase opacity-60 hover:opacity-100 transition-opacity">{s}</a>
                        ))}
                        <button onClick={() => setIsDark(!isDark)} className="p-2 opacity-60 hover:opacity-100 transition-opacity" aria-label="Toggle theme">
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                        <a href="#join" className={`text-xs font-bold tracking-[0.2em] uppercase px-4 py-2 ${btnFill} hover:opacity-80 transition-all`}>
                            Get Started
                        </a>
                    </div>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section className={`pt-32 pb-20 md:pt-44 md:pb-32 border-b ${border}`}>
                <div className="max-w-screen-xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                        <div className="flex-1 text-center lg:text-left space-y-8">
                            <p className="text-[10px] tracking-[0.4em] uppercase text-green-400/80">For creators who ship</p>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tighter uppercase">
                                Grow<br />Your<br />Creative<br />Forest
                            </h1>
                            <p className={`text-sm md:text-base ${muted} max-w-md font-light leading-relaxed`}>
                                The accountability platform that turns your daily creative process into a living, breathing garden.
                                Organize deep. Commit daily. Watch it grow.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
                                <a href="#join" className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 ${btnFill} hover:opacity-80 transition-all`}>
                                    Start Growing <ArrowRight className="h-3.5 w-3.5" />
                                </a>
                                <a href="#valley" className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 border ${btnGhost} transition-all`}>
                                    See How It Works
                                </a>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="relative">
                                <HeroTree />
                                <div className={`absolute top-16 -right-4 text-[8px] tracking-[0.2em] uppercase ${dimText} border ${borderFine} px-2 py-0.5 ${tagBg} backdrop-blur`}>12 commits</div>
                                <div className={`absolute top-44 -left-6 text-[8px] tracking-[0.2em] uppercase ${dimText} border ${borderFine} px-2 py-0.5 ${tagBg} backdrop-blur`}>4 branches</div>
                                <div className="absolute bottom-24 -right-4 text-[8px] tracking-[0.2em] uppercase text-green-400/60 border border-green-500/20 px-2 py-0.5 bg-green-500/5 backdrop-blur">Active ●</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── STATS ─── */}
            <section className={`py-10 border-b ${border}`}>
                <div className="max-w-screen-lg mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[{ v: '12', l: 'Tables' }, { v: '30+', l: 'RLS Policies' }, { v: '20+', l: 'Indexes' }, { v: '<100ms', l: 'Response' }].map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl md:text-3xl font-bold tracking-tighter">{s.v}</div>
                            <div className={`text-[9px] uppercase tracking-[0.2em] ${dimText} mt-1`}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── PILLAR I : VALLEY ─── */}
            <section id="valley" className={`py-24 md:py-32 border-b ${border}`}>
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 space-y-16">
                    <Reveal>
                        <div className="max-w-xl space-y-4">
                            <p className={`text-[10px] tracking-[0.3em] uppercase ${subtle}`}>Pillar I</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">Project Valley</h2>
                            <p className={`text-[10px] tracking-[0.2em] uppercase ${subtle}`}>Structure Your Chaos</p>
                            <p className={`text-sm ${muted} leading-relaxed`}>
                                Your private workspace for the full lifecycle of a creative project. Consolidate moodboards, research, drafts, and documentation — no more scattering across five tools.
                            </p>
                        </div>
                    </Reveal>
                    <Reveal><ValleyDemo /></Reveal>
                    <Reveal>
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-px ${gridGap} border ${border}`}>
                            {[
                                'Projects → Channels → Blocks',
                                'Cinematic video reel',
                                'Masonry moodboard layout',
                                'RLS-secured by default',
                            ].map((t, i) => (
                                <div key={i} className={`${bg} p-4 text-center`}>
                                    <span className={`text-[10px] uppercase tracking-widest ${subtle}`}>{t}</span>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ─── PILLAR II : LOCOMMIT ─── */}
            <section id="locommit" className={`py-24 md:py-32 border-b ${border}`}>
                <div className="max-w-screen-xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
                        <Reveal className="flex-1 space-y-6">
                            <p className={`text-[10px] tracking-[0.3em] uppercase ${subtle}`}>Pillar II</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">LoCommit</h2>
                            <p className={`text-[10px] tracking-[0.2em] uppercase ${subtle}`}>The Daily Accountability Heartbeat</p>
                            <p className={`text-sm ${muted} leading-relaxed`}>
                                Every day at 9:00 AM (UTC+8), the global clock resets. Until you share your progress — a 30-second video, a sketch, a note — the community feed stays locked. Contribution before consumption.
                            </p>
                            <div className="space-y-4 pt-4">
                                {[
                                    'Global Reset at 9:00 AM Taiwan Time',
                                    'Non-dismissible overlay until daily update posted',
                                    'Tree grows one node per commit — break the chain & it withers',
                                ].map((t, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="text-[10px] text-green-400/50 mt-0.5">0{i + 1}</span>
                                        <span className={`text-xs ${muted} leading-relaxed`}>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </Reveal>

                        {/* LoCommit card */}
                        <Reveal className="flex-1 flex justify-center">
                            <div className="w-full max-w-sm border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 space-y-6">
                                <div className="text-center space-y-2">
                                    <p className="text-[9px] uppercase tracking-[0.25em] text-orange-400 flex items-center justify-center gap-1.5"><Lock className="h-2.5 w-2.5" /> Locked</p>
                                    <h3 className="text-lg font-bold uppercase tracking-tighter">Daily LoCommit</h3>
                                    <p className="text-[10px] text-white/40">Share your progress to unlock the Forest</p>
                                </div>
                                <div className="aspect-video border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-green-500/30 transition-colors">
                                    <ArrowRight className="h-5 w-5 text-white/30 rotate-[-90deg]" />
                                    <span className="text-[10px] text-white/35">Upload video or image</span>
                                    <span className="text-[8px] text-white/20 uppercase tracking-widest">Max 30 seconds</span>
                                </div>
                                <Input placeholder="What did you work on today?" className="border-0 border-b border-white/15 rounded-none px-0 text-sm text-white focus-visible:ring-0 focus-visible:border-green-500 placeholder:text-white/25" disabled />
                                <button className="w-full py-3 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest cursor-default border border-green-500/20">
                                    Submit &amp; Unlock 🌿
                                </button>
                                <div className="flex gap-[2px] justify-center flex-wrap pt-2">
                                    {[0, 1, 2, 0, 3, 4, 3, 2, 1, 0, 0, 1, 3, 4, 4, 3, 2, 1, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0].map((v, i) => (
                                        <div key={i} className="w-2.5 h-2.5" style={{ backgroundColor: `rgba(74, 222, 128, ${[0.05, 0.15, 0.3, 0.5, 0.8][v]})` }} />
                                    ))}
                                </div>
                                <p className="text-[8px] uppercase tracking-widest text-white/30 text-center">28-day streak</p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ─── PILLAR III : FOREST ─── */}
            <section id="forest" className={`py-24 md:py-32 border-b ${border}`}>
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 space-y-16">
                    <Reveal>
                        <div className="max-w-xl space-y-4">
                            <p className={`text-[10px] tracking-[0.3em] uppercase ${subtle}`}>Pillar III</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">The Forest</h2>
                            <p className={`text-[10px] tracking-[0.2em] uppercase ${subtle}`}>Explore the Community Garden</p>
                            <p className={`text-sm ${muted} leading-relaxed`}>
                                Replace the infinite vertical scroll with a spatial, explorable garden. Each project is a living tree — its height shows commitment, its branches show community love, and its color shows its soul.
                            </p>
                        </div>
                    </Reveal>
                    <Reveal><ForestDemo /></Reveal>
                    <Reveal>
                        <div className={`grid grid-cols-2 md:grid-cols-4 gap-px ${gridGap} border ${border}`}>
                            {[
                                'Trunk = daily commits',
                                'Branches = engagement',
                                "Fermat\u2019s Spiral layout",
                                'Spatial > algorithmic',
                            ].map((t, i) => (
                                <div key={i} className={`${bg} p-4 text-center`}>
                                    <span className={`text-[10px] uppercase tracking-widest ${subtle}`}>{t}</span>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ─── BEHAVIORAL DESIGN ─── */}
            <section className={`py-24 md:py-32 border-b ${border}`}>
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 space-y-16">
                    <Reveal>
                        <div className="max-w-xl space-y-4">
                            <p className={`text-[10px] tracking-[0.3em] uppercase ${subtle}`}>Behavioral Design</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">The Carrot &amp; The Stick</h2>
                            <p className={`text-sm ${muted}`}>Consistency is currency.</p>
                        </div>
                    </Reveal>
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px ${gridGap} border ${border}`}>
                        {[
                            { n: '01', t: 'Tree Growth', d: 'Each daily commit adds a visible node to your trunk. Consistency = towering presence.' },
                            { n: '02', t: 'Engagement Branches', d: 'Comments grow organic branches. Branch density = popularity at a glance.' },
                            { n: '03', t: 'Center Stage', d: "Active projects placed at the Forest center via Fermat\u2019s Spiral." },
                            { n: '04', t: 'The Daily Lock', d: "Can\u2019t browse until you contribute. Contribution-first culture." },
                            { n: '05', t: 'Withered State', d: '48 hours without an update? Your tree fades to grayscale. Gentle social pressure.' },
                            { n: '06', t: 'Seed State', d: 'New projects start as a glowing orb. Growth must be earned.' },
                        ].map((c, i) => (
                            <Reveal key={i}>
                                <div className={`${bg} p-8 space-y-3 ${cardHover} transition-all cursor-default h-full`}>
                                    <span className="text-[10px] tracking-widest text-green-400/50">{c.n}</span>
                                    <h3 className="text-sm font-bold uppercase tracking-widest">{c.t}</h3>
                                    <p className={`text-[11px] ${subtle} leading-relaxed`}>{c.d}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TECH ─── */}
            <section className={`py-24 md:py-32 border-b ${border}`}>
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 space-y-16">
                    <Reveal>
                        <div className="max-w-xl space-y-4">
                            <p className={`text-[10px] tracking-[0.3em] uppercase ${subtle}`}>Under the Hood</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">Built for Scale</h2>
                        </div>
                    </Reveal>
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-px ${gridGap} border ${border}`}>
                        {[
                            { n: 'Next.js 15', d: 'React Server Components' },
                            { n: 'Supabase', d: 'Auth + DB + Storage' },
                            { n: 'PostgreSQL', d: '12 tables, 30+ RLS' },
                            { n: 'Vercel Edge', d: 'Global CDN delivery' },
                            { n: '20+ Indexes', d: 'O(log n) queries' },
                            { n: 'GIN Search', d: 'Fuzzy full-text search' },
                            { n: 'Optimistic UI', d: '<100ms perceived' },
                            { n: 'Radix a11y', d: 'WCAG compliant' },
                        ].map((t, i) => (
                            <div key={i} className={`${bg} p-5 text-center ${cardHover} transition-all cursor-default`}>
                                <div className="text-xs font-bold uppercase tracking-widest">{t.n}</div>
                                <div className={`text-[9px] uppercase tracking-widest ${faintText} mt-1`}>{t.d}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── SIGNUP ─── */}
            <section id="join" className="py-24 md:py-32">
                <div className="max-w-md mx-auto px-6 md:px-12">
                    <Reveal>
                        <div className="text-center mb-12 space-y-3">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">Plant Your<br />First Seed</h2>
                            <p className={`text-[10px] uppercase tracking-[0.2em] ${subtle}`}>Join the community. Start your tree.</p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className={`border ${border} ${overlay} p-8 space-y-6`}>
                            {/* Toggle */}
                            <div className={`flex border ${border}`}>
                                <button onClick={() => { setIsSignup(true); setError(''); setMessage('') }}
                                    className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 transition-all ${isSignup ? btnFill : inactiveTab}`}>Sign Up</button>
                                <button onClick={() => { setIsSignup(false); setError(''); setMessage('') }}
                                    className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 transition-all ${!isSignup ? btnFill : inactiveTab}`}>Log In</button>
                            </div>

                            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                            {message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}

                            <form onSubmit={handleAuth} className="space-y-6">
                                <div className="space-y-2">
                                    <label className={`text-[10px] uppercase tracking-widest ${subtle}`}>Email</label>
                                    <div className="relative">
                                        <Mail className={`absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${iconDim}`} />
                                        <Input type="email" placeholder="you@creative.studio" value={email} onChange={(e) => setEmail(e.target.value)}
                                            className={`border-0 border-b ${borderFine} rounded-none pl-6 text-sm ${inputText} focus-visible:ring-0 ${focusBorder} ${placeholder}`} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-[10px] uppercase tracking-widest ${subtle}`}>Password</label>
                                    <div className="relative">
                                        <Lock className={`absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${iconDim}`} />
                                        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                                            className={`border-0 border-b ${borderFine} rounded-none pl-6 text-sm ${inputText} focus-visible:ring-0 ${focusBorder} ${placeholder}`} required minLength={6} />
                                    </div>
                                </div>
                                <button type="submit" className={`w-full py-3.5 ${btnFill} text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40`} disabled={isLoading}>
                                    {isLoading && <Loader2 className="inline mr-2 h-3.5 w-3.5 animate-spin" />}
                                    {isSignup ? 'Create Account' : 'Sign In'}
                                </button>
                            </form>

                            <div className="flex items-center gap-4">
                                <span className={`flex-1 border-t ${border}`} />
                                <span className={`text-[9px] uppercase tracking-widest ${microText}`}>or</span>
                                <span className={`flex-1 border-t ${border}`} />
                            </div>

                            <button onClick={handleGoogle} className={`w-full py-3.5 border ${btnGhost} text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40`} disabled={isLoading}>
                                Continue with Google
                            </button>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className={`border-t ${border} py-12`}>
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="text-sm font-bold tracking-tighter uppercase">TRYBE</span>
                    <p className={`text-[10px] uppercase tracking-widest ${faintText}`}>Cultivating Creative Belonging</p>
                    <div className="flex gap-6">
                        {['Valley', 'LoCommit', 'Forest'].map(s => (
                            <a key={s} href={`#${s.toLowerCase()}`} className={`text-[10px] uppercase tracking-widest ${faintText} hover:opacity-100 transition-opacity`}>{s}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}
