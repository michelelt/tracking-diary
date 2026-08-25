'use client'

import { Entry } from '@/lib/validators'
import { useCallback, useEffect, useState } from 'react'

type EntryData = {
  id: string
  userId: string
  date: string
  sleep?: any
  energy?: any
  mood?: 'basso' | 'neutro' | 'buono' | 'molto_buono' | null
  movement?: any
  stimulation?: 'poco' | 'normale' | 'tanto' | 'troppo' | null
  positiveThing?: string
  createdAt: string
  updatedAt: string
}

export function useEntry(date: string) {
  const [entry, setEntry] = useState<EntryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch entry
  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/entries?date=${date}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setEntry(data.entry)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchEntry()
  }, [date])

  // Save entry (partial update)
  const saveEntry = useCallback(
    async (updates: Partial<Entry>) => {
      try {
        const formattedDate = date.includes('T') ? date.split('T')[0] : date

        const payload: Entry = {
          date: formattedDate,
          sleep: updates.sleep ?? entry?.sleep,
          energy: updates.energy ?? entry?.energy,
          mood: updates.mood ?? entry?.mood,
          movement: updates.movement ?? entry?.movement,
          stimulation: updates.stimulation ?? entry?.stimulation,
          positiveThing: updates.positiveThing ?? entry?.positiveThing,
        }

        const res = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error('Failed to save')
        const data = await res.json()
        setEntry(data.entry)
        return data.entry
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        throw err
      }
    },
    [date, entry]
  )

  return { entry, loading, error, saveEntry }
}
