'use client'

import Navigation from '@/components/Navigation'
import { MOODS } from '@/lib/constants'
import { Entry } from '@/lib/validators'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface CalendarEntry extends Entry {
  id: string
  createdAt: string
  updatedAt: string
}

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<Record<string, CalendarEntry>>({})
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [futureBanner, setFutureBanner] = useState(false)

  // Auto-hide the "future day" banner
  useEffect(() => {
    if (!futureBanner) return
    const timer = setTimeout(() => setFutureBanner(false), 3500)
    return () => clearTimeout(timer)
  }, [futureBanner])

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

  const getMoodColor = (mood?: string | null) => {
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

  const handleSelectDay = (day: number) => {
    const dateStr = getDateString(day)

    // Future days can't be opened: only today or the past
    if (dateStr > getTodayString()) {
      setFutureBanner(true)
      return
    }

    const entry = entries[dateStr]

    // Empty day: go straight to creating a new entry for that date
    if (!entry) {
      router.push(`/today?date=${dateStr}`)
      return
    }

    setSelectedEntry(entry)
    setDeleteConfirm(null)
  }

  const handleDelete = async (dateStr: string) => {
    try {
      const res = await fetch('/api/entries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr }),
      })

      if (res.ok) {
        const newEntries = { ...entries }
        delete newEntries[dateStr]
        setEntries(newEntries)
        setSelectedEntry(null)
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const monthName = new Date(year, month).toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <Navigation />
      {futureBanner && (
        <div
          role="alert"
          onClick={() => setFutureBanner(false)}
          className="fixed top-20 left-1/2 z-50 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 cursor-pointer rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white shadow-lg dark:bg-slate-50 dark:text-slate-900"
        >
          Come fai a sapere come starai nel futuro?
        </div>
      )}
      <div className="page">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header + month navigation */}
            <div className="flex items-center justify-between gap-3">
              <h1 className="page-title capitalize">{monthName}</h1>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} aria-label="Mese precedente" className="btn-secondary">
                  ←
                </button>
                <button onClick={handleToday} className="btn-secondary">
                  Oggi
                </button>
                <button onClick={handleNextMonth} aria-label="Mese successivo" className="btn-secondary">
                  →
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="card">
              {loading ? (
                <div className="state min-h-[24rem]" role="status">Caricamento…</div>
              ) : (
                <>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 py-2"
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
                      const isSelected = selectedEntry?.date === dateStr

                      return (
                        <button
                          key={day}
                          onClick={() => handleSelectDay(day)}
                          aria-current={isToday ? 'date' : undefined}
                          className={`aspect-square p-1 sm:p-2 rounded-lg text-center text-sm transition ${moodColor} ${
                            isToday ? 'ring-2 ring-accent' : 'hover:brightness-95'
                          } ${isSelected ? 'ring-2 ring-slate-900' : ''} ${
                            dateStr > getTodayString() ? 'opacity-50' : ''
                          }`}
                        >
                          <div className={`font-medium tabular-nums ${entry?.mood === 'molto_buono' ? 'text-white' : 'text-slate-900'}`}>
                            {day}
                          </div>
                          {entry && (
                            <div className="text-xs mt-1 text-slate-700 dark:text-slate-300">
                              {entry.mood ? MOODS[entry.mood as keyof typeof MOODS]?.emoji : '✓'}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Entry Details Panel */}
          <div className="lg:col-span-1">
            {selectedEntry ? (
              <div className="card space-y-4">
                <div className="space-y-2">
                  <h2 className="text-base font-semibold text-slate-900 first-letter:uppercase dark:text-slate-50">
                    {new Date(selectedEntry.date).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h2>

                  {/* Sleep */}
                  {selectedEntry.sleep && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                        Sonno
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {selectedEntry.sleep.hoursSlept && (
                          <div>Ore: {selectedEntry.sleep.hoursSlept}h</div>
                        )}
                        {selectedEntry.sleep.bedTime && (
                          <div>A letto: {selectedEntry.sleep.bedTime}</div>
                        )}
                        {selectedEntry.sleep.feeling && (
                          <div>Sensazione: {selectedEntry.sleep.feeling}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Energy */}
                  {selectedEntry.energy && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                        Energia
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {selectedEntry.energy.morning && (
                          <div>Mattina: {selectedEntry.energy.morning}/10</div>
                        )}
                        {selectedEntry.energy.afternoon && (
                          <div>Pomeriggio: {selectedEntry.energy.afternoon}/10</div>
                        )}
                        {selectedEntry.energy.evening && (
                          <div>Sera: {selectedEntry.energy.evening}/10</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mood */}
                  {selectedEntry.mood && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                        Umore
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedEntry.mood}
                      </div>
                    </div>
                  )}

                  {/* Movement */}
                  {selectedEntry.movement && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                        Movimento
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {selectedEntry.movement.types?.join(', ')}
                        {selectedEntry.movement.notes && (
                          <div className="text-xs text-slate-500 mt-1">
                            Note: {selectedEntry.movement.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stimulation */}
                  {selectedEntry.stimulation && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                        Stimolazione
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedEntry.stimulation}
                      </div>
                    </div>
                  )}

                  {/* Positive Thing */}
                  {selectedEntry.positiveThing && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                        Una cosa bella
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedEntry.positiveThing}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <Link
                    href={`/today?date=${selectedEntry.date}`}
                    className="btn-primary w-full"
                  >
                    Modifica
                  </Link>

                  {deleteConfirm === selectedEntry.date ? (
                    <div className="space-y-2">
                      <p role="alert" className="text-sm text-red-700 dark:text-red-400 font-medium">
                        Eliminare questo giorno? Non si può annullare.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(selectedEntry.date)}
                          className="btn-danger flex-1"
                        >
                          Elimina
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="btn-secondary flex-1"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(selectedEntry.date)}
                      className="btn w-full text-red-700 hover:bg-red-50"
                    >
                      Elimina giorno
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="card py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                <p className="font-medium text-slate-700 dark:text-slate-300">Seleziona un giorno</p>
                <p className="mt-2">I giorni colorati hanno già una registrazione.</p>
                <p className="mt-1">Tocca un giorno vuoto per compilarlo.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
