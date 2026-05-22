import { useState, useCallback } from 'react'

export interface Channel {
  id: string
  name: string
  description: string
  tokenAddress?: string
  minBalance?: number
  memberCount: number
  createdAt: number
  createdBy: string
}

const CHANNELS_KEY = 'inbox3_channels'

export function useTokenGatedChannels() {
  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const raw = localStorage.getItem(CHANNELS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const createChannel = useCallback((channel: Omit<Channel, 'id' | 'createdAt' | 'memberCount'>) => {
    const newChannel: Channel = {
      ...channel,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      memberCount: 1,
    }
    setChannels(prev => {
      const next = [newChannel, ...prev]
      localStorage.setItem(CHANNELS_KEY, JSON.stringify(next))
      return next
    })
    return newChannel
  }, [])

  const removeChannel = useCallback((id: string) => {
    setChannels(prev => {
      const next = prev.filter(c => c.id !== id)
      localStorage.setItem(CHANNELS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { channels, createChannel, removeChannel }
}
