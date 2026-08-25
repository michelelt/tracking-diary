'use client'

import Navigation from '@/components/Navigation'
import { MOODS } from '@/lib/constants'
import { useState, useEffect } from 'react'

interface CalendarEntry {
  date: string
  mood?: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<Record<string, CalendarEntry>>({})
  const [loading, setLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Fetch all entries for the current month
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true)

        // Fetch entries for the month
        const res = await fetch(
          `/api/entries/month?year=${year}&month=${month + 1}`
        )
        if (res.ok) {
          const data = await res.json()
          const entriesMap: Record<string, CalendarEntry> = {}
          data.entries?.forEach((entry: CalendarEntry) => {
            entriesMap[entry.date] = entry
          })
          setEntries(entriesMap)
        }
      } catch (err) {
        console.error('Error fetching entries:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [year, month])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfWeek }, () => null)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const getMoodColor = (mood?: string) => {
    if (!mood) return 'bg-slate-100 dark:bg-slate-700'
    const moodConfig = MOODS[mood as keyof typeof MOODS]
    return moodConfig?.color || 'bg-slate-100 dark:bg-slate-700'
  }

  const getDateString = (day: number) => {
    const date = new Date(year, month, day)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const getTodayString = () => {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const monthName = new Date(year, month).toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900 pb-24">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 capitalize">
                📅 {monthName}
              </h1>
              <button
                onClick={handleToday}
                className="text-sm px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Oggi
              </button>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevMonth}
                className="px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                ← Precedente
              </button>
              <button
                onClick={handleNextMonth}
                className="px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Successivo →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="card">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Caricamento...</div>
            ) : (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {days.map((day) => {
                    const dateStr = getDateString(day)
                    const entry = entries[dateStr]
                    const moodColor = getMoodColor(entry?.mood)
                    const isToday = getTodayString() === dateStr

                    return (
                      <div
                        key={day}
                        className={`aspect-square p-2 rounded text-center text-sm cursor-pointer transition-colors ${moodColor} ${
                          isToday
                            ? 'ring-2 ring-blue-500 font-bold'
                            : 'hover:opacity-80'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 dark:text-slate-50">
                          {day}
                        </div>
                        {entry && (
                          <div className="text-xs mt-1 text-slate-700 dark:text-slate-300">
                            {entry.mood && MOODS[entry.mood as keyof typeof MOODS]?.emoji}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Legend */}
          <div className="card">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-3">
              Legenda Mood
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(MOODS).map(([key, { label, emoji, color }]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded ${color}`} />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {emoji} {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
