"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getChannels, createChannel, deleteChannel } from '@/lib/supabase/queries'
import { Channel } from '@/types'
import { ArrowLeft, Plus, Trash2, Grid3X3 } from 'lucide-react'

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>()
  const router = useRouter()
  const projectId = params?.projectId as string

  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newChannelName, setNewChannelName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!projectId) return
      setLoading(true)
      setError('')
      try {
        const data = await getChannels(projectId)
        setChannels(data)
      } catch (e) {
        setError('Failed to load channels')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return
    setCreating(true)
    const created = await createChannel({
      project_id: projectId as unknown as string,
      name: newChannelName.trim(),
      color: 'bg-neutral-700',
      order_index: channels.length,
    } as unknown as Channel)
    setCreating(false)
    if (created) {
      setChannels(prev => [...prev, created])
      setNewChannelName('')
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    const prev = channels
    setChannels(prev.filter(c => c.id !== channelId))
    const ok = await deleteChannel(channelId)
    if (!ok) setChannels(prev)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.push('/valley')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Project</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="New channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <Button onClick={handleCreateChannel} disabled={!newChannelName.trim() || creating}>
              <Plus className="h-4 w-4 mr-1" />
              {creating ? 'Creating…' : 'Add Channel'}
            </Button>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading channels…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : channels.length === 0 ? (
            <div className="text-sm text-muted-foreground">No channels yet. Create your first channel.</div>
          ) : (
            <div className="space-y-2">
              {channels.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${c.color}`} />
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteChannel(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
