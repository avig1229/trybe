'use client'

import { useState } from 'react'
import { Tribe } from '@/types'
import { updateTribe } from '@/lib/supabase/queries'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TRIBE_COLORS = [
    '#6366f1', '#8b5cf6', '#f43f5e', '#f59e0b',
    '#10b981', '#0ea5e9', '#fb7185', '#84cc16',
]

interface EditTribeModalProps {
    tribe: Tribe
    onClose: () => void
    onSave: () => void
}

export function EditTribeModal({ tribe, onClose, onSave }: EditTribeModalProps) {
    const [description, setDescription] = useState(tribe.description)
    const [color, setColor] = useState(tribe.color)
    const [rules, setRules] = useState<string[]>(tribe.rules || [''])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const updateRule = (i: number, v: string) => {
        const next = [...rules]; next[i] = v; setRules(next)
    }

    const handleSave = async () => {
        setError('')
        if (!description.trim()) return setError('Description is required.')
        setLoading(true)
        const result = await updateTribe(tribe.id, {
            description: description.trim(),
            color,
            rules: rules.filter(r => r.trim()),
        })
        setLoading(false)
        if (!result) return setError('Failed to save changes.')
        onSave()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-background border border-neutral-200 dark:border-neutral-800 w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-sm font-bold uppercase tracking-widest">Tribe Settings</h2>
                    <button onClick={onClose} className="opacity-50 hover:opacity-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-widest">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            maxLength={300}
                            className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2.5 text-sm outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest">Accent Color</label>
                        <div className="flex flex-wrap gap-3">
                            {TRIBE_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`h-7 w-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-current scale-110' : 'opacity-70 hover:opacity-100'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest">Rules</label>
                        {rules.map((rule, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    value={rule}
                                    onChange={e => updateRule(i, e.target.value)}
                                    placeholder={`Rule ${i + 1}`}
                                    className="flex-1 bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm outline-none"
                                />
                                {rules.length > 1 && (
                                    <button onClick={() => setRules(rules.filter((_, j) => j !== i))} className="opacity-50 hover:opacity-100 px-2">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {rules.length < 6 && (
                            <button onClick={() => setRules([...rules, ''])} className="text-xs opacity-50 hover:opacity-100">
                                + Add rule
                            </button>
                        )}
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>

                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
                    <Button onClick={handleSave} disabled={loading} size="sm">
                        {loading ? 'Saving…' : 'Save Changes'}
                    </Button>
                    <Button onClick={onClose} variant="ghost" size="sm">Cancel</Button>
                </div>
            </div>
        </div>
    )
}
