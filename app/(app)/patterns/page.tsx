'use client'

import Navigation from '@/components/Navigation'
import { MOODS, MOVEMENT_TYPES } from '@/lib/constants'
import { useState, useEffect } from 'react'

interface PatternData {
  moodDistribution: Record<string, number>
  movementFrequency: Record<string, number>
  averageEnergy: number
  averageSleep: number
  totalEntries: number
  dateRange: {
    start: string
    end: string
  }
}

const statValue = 'text-3xl font-semibold tabular-nums tracking-tight leading-none text-slate-900 dark:text-slate-50'

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<PatternData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/patterns')
        if (res.ok) {
          const data = await res.json()
          setPatterns(data)
        }
      } catch (err) {
        console.error('Error fetching patterns:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPatterns()
  }, [])

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="page">
          <div className="state" role="status">Caricamento…</div>
        </div>
      </>
    )
  }

  if (!patterns) {
    return (
      <>
        <Navigation />
        <div className="page">
          <div className="state" role="status">Non è stato possibile caricare i dati. Riprova tra poco.</div>
        </div>
      </>
    )
  }

  const sortedMoods = Object.entries(patterns.moodDistribution)
    .sort((a, b) => b[1] - a[1])
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / patterns.totalEntries) * 100),
    }))

  const sortedMovements = Object.entries(patterns.movementFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([movement, count]) => ({
      movement,
      count,
      percentage: Math.round((count / patterns.totalEntries) * 100),
    }))

  return (
    <>
      <Navigation />
      <div className="page">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="page-title">Statistiche</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Dal {formatDate(patterns.dateRange.start)} al {formatDate(patterns.dateRange.end)}
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card !p-4 space-y-2">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Giorni registrati</div>
              <div className={statValue}>{patterns.totalEntries}</div>
            </div>

            <div className="card !p-4 space-y-2">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Energia media</div>
              <div className={statValue}>{patterns.averageEnergy.toFixed(1)}/10</div>
            </div>

            <div className="card !p-4 space-y-2">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Sonno medio</div>
              <div className={statValue}>{patterns.averageSleep.toFixed(1)}h</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mood Distribution */}
          <div className="card">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-4">
              Distribuzione dell&apos;umore
            </h2>
            <div className="space-y-4">
              {sortedMoods.map(({ mood, count, percentage }) => {
                const moodConfig = MOODS[mood as keyof typeof MOODS]
                return (
                  <div key={mood} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span>{moodConfig?.emoji}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          {moodConfig?.label}
                        </span>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${moodConfig?.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Movement Frequency */}
          <div className="card">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-4">
              Movimento
            </h2>
            <div className="space-y-4">
              {sortedMovements.length > 0 ? (
                sortedMovements.map(({ movement, count, percentage }) => {
                  const movementConfig = MOVEMENT_TYPES.find(
                    (m) => m.id === movement
                  )
                  return (
                    <div key={movement} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span>{movementConfig?.emoji}</span>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            {movementConfig?.label}
                          </span>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Nessun dato di movimento
                </p>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  )
}
