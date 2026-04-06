'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTribe, joinTribe, getTribeUnlockStatus } from '@/lib/supabase/queries'
import { TribeUnlockProgress } from '@/components/TribeUnlockProgress'
import { TribeUnlockStatus } from '@/types'
import { X, Plus, Sparkles, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Preset color palette for tribe accents
const TRIBE_COLORS = [
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Violet', value: '#8b5cf6' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Sky', value: '#0ea5e9' },
    { label: 'Coral', value: '#fb7185' },
    { label: 'Lime', value: '#84cc16' },
]

interface CreateTribeFormProps {
    userId: string
    unlockStatus: TribeUnlockStatus
    onSuccess?: (slug: string) => void
    onCancel?: () => void
}

function toSlug(str: string) {
    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function CreateTribeForm({ userId, unlockStatus, onSuccess, onCancel }: CreateTribeFormProps) {
    const router = useRouter()
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [slugManual, setSlugManual] = useState(false)
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [rules, setRules] = useState<string[]>([''])
    const [color, setColor] = useState(TRIBE_COLORS[0].value)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleNameChange = (v: string) => {
        setName(v)
        if (!slugManual) setSlug(toSlug(v))
    }

    const handleSlugChange = (v: string) => {
        setSlugManual(true)
        setSlug(toSlug(v))
    }

    const addTag = () => {
        const t = tagInput.trim().toLowerCase()
        if (t && !tags.includes(t) && tags.length < 5) {
            setTags([...tags, t])
            setTagInput('')
        }
    }

    const removeTag = (t: string) => setTags(tags.filter(x => x !== t))

    const updateRule = (i: number, v: string) => {
        const next = [...rules]; next[i] = v; setRules(next)
    }
    const addRule = () => rules.length < 6 && setRules([...rules, ''])
    const removeRule = (i: number) => setRules(rules.filter((_, j) => j !== i))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!name.trim()) return setError('Tribe name is required.')
        if (!description.trim()) return setError('Description is required.')
        if (tags.length < 1) return setError('Add at least 1 tag.')

        setLoading(true)
        const tribe = await createTribe({
            name: name.trim(),
            slug,
            description: description.trim(),
            isPublic: true,
            tags,
            rules: rules.filter(r => r.trim()),
            color,
            creatorId: userId,
        })
        if (!tribe) { setLoading(false); return setError('Failed to create tribe. Slug may already be taken.') }

        // Auto-join as admin
        await joinTribe(userId, tribe.id)

        setLoading(false)
        if (onSuccess) onSuccess(tribe.slug)
        else router.push(`/tribes/${tribe.slug}`)
    }

    if (!unlockStatus.isUnlocked) {
        return (
            <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-8 pt-12">
                <div className="space-y-4">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Tribe Creation Locked</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto">
                        Founding a Tribe is a privilege reserved for committed creators. Prove your dedication by uploading media assets to your project vault and maintaining a 7-day update streak.
                    </p>
                </div>
                <div className="w-full max-w-md text-left text-sm">
                    <TribeUnlockProgress status={unlockStatus} />
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Found a Tribe</h1>
                <p className="text-muted-foreground text-sm mt-1">Your tribe will be reviewed before going live.</p>
            </div>

            {/* Name + Slug */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest">Tribe Name *</label>
                    <input
                        value={name}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder="e.g. Indie Animators"
                        maxLength={40}
                        className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-none px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-neutral-500"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest">Slug (URL)</label>
                    <div className="flex items-center border border-neutral-300 dark:border-neutral-700">
                        <span className="px-3 py-2.5 text-xs text-muted-foreground border-r border-neutral-300 dark:border-neutral-700 select-none">
                            /tribes/
                        </span>
                        <input
                            value={slug}
                            onChange={e => handleSlugChange(e.target.value)}
                            placeholder="indie-animators"
                            maxLength={50}
                            className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest">Description *</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What is this tribe about? Who should join?"
                    rows={3}
                    maxLength={300}
                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-none px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
                />
                <p className="text-[11px] text-muted-foreground text-right">{description.length}/300</p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Tags * (up to 5)</label>
                <div className="flex gap-2">
                    <input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                        placeholder="e.g. animation"
                        className="flex-1 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-none px-3 py-2 text-sm outline-none"
                    />
                    <button type="button" onClick={addTag} className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 text-xs uppercase tracking-widest hover-invert transition-all">
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tags.map(t => (
                        <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-xs rounded-full">
                            {t}
                            <button type="button" onClick={() => removeTag(t)} className="opacity-50 hover:opacity-100">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Tribe Color */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Accent Color</label>
                <div className="flex flex-wrap gap-3">
                    {TRIBE_COLORS.map(c => (
                        <button
                            key={c.value}
                            type="button"
                            title={c.label}
                            onClick={() => setColor(c.value)}
                            className={`h-8 w-8 rounded-full transition-transform ${color === c.value ? 'ring-2 ring-offset-2 ring-current scale-110' : 'opacity-70 hover:opacity-100'}`}
                            style={{ backgroundColor: c.value }}
                        />
                    ))}
                </div>
                <p className="text-[11px] text-muted-foreground">This colour marks your tribe in the Forest.</p>
            </div>

            {/* Rules */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest">Tribe Rules (optional, up to 6)</label>
                {rules.map((rule, i) => (
                    <div key={i} className="flex gap-2">
                        <input
                            value={rule}
                            onChange={e => updateRule(i, e.target.value)}
                            placeholder={`Rule ${i + 1}`}
                            className="flex-1 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-none px-3 py-2 text-sm outline-none"
                        />
                        {rules.length > 1 && (
                            <button type="button" onClick={() => removeRule(i)} className="px-2 opacity-50 hover:opacity-100">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                ))}
                {rules.length < 6 && (
                    <button type="button" onClick={addRule} className="text-xs opacity-50 hover:opacity-100 flex items-center gap-1">
                        <Plus className="h-3 w-3" /> Add rule
                    </button>
                )}
            </div>

            {error && <p className="text-red-500 text-sm border border-red-300 px-3 py-2">{error}</p>}

            <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {loading ? 'Submitting…' : 'Submit for Review'}
                </Button>
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                )}
            </div>
            <p className="text-[11px] text-muted-foreground">
                Tribes go live after admin review. You&apos;ll be notified once approved.
            </p>
        </form>
    )
}
