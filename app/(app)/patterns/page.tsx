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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-24">
          <div className="text-center py-12">Caricamento patterns...</div>
        </div>
      </>
    )
  }

  if (!patterns) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-24">
          <div className="text-center py-12">Nessun dato disponibile</div>
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
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900 pb-24">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              📊 Patterns & Statistiche
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Dal {patterns.dateRange.start} al {patterns.dateRange.end}
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Totale Entry
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {patterns.totalEntries}
              </div>
            </div>

            <div className="card bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Energia Media
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {patterns.averageEnergy.toFixed(1)}/10
              </div>
            </div>

            <div className="card bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Sonno Medio
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {patterns.averageSleep.toFixed(1)}h
              </div>
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              😊 Distribuzione Mood
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
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              🏃 Frequenza Movimento
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
                          className="h-2 rounded-full bg-green-500"
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
    </>
  )
}
