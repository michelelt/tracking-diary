'use client'

import Navigation from '@/components/Navigation'
import { MOODS, MOVEMENT_TYPES, SLEEP_FEELINGS, STIMULATION_LEVELS } from '@/lib/constants'
import { localDateString } from '@/lib/dates'
import { Entry } from '@/lib/validators'
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
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
    if (!mood) return 'bg-surface text-ink'
    const moodConfig = MOODS[mood as keyof typeof MOODS]
    return moodConfig?.color || 'bg-surface text-ink'
  }

  const getDateString = (day: number) => localDateString(new Date(year, month, day))
  const todayStr = localDateString()

  const handleSelectDay = (day: number) => {
    const dateStr = getDateString(day)

    // Future days can't be opened: only today or the past
    if (dateStr > todayStr) {
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

  // Stored keys -> readable labels
  const labelOf = (map: Record<string, { label: string }>, key: string) => map[key]?.label ?? key

  return (
    <>
      <Navigation />
      {futureBanner && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
          <div
            role="alert"
            onClick={() => setFutureBanner(false)}
            className="pointer-events-auto animate-rise cursor-pointer rounded-control bg-ink px-4 py-3 text-center text-sm font-semibold text-bg"
          >
            Un giorno alla volta. Il futuro può aspettare.
          </div>
        </div>
      )}
      <div className="page">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Calendar */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header + month navigation */}
            <div className="flex items-center justify-between gap-3">
              <h1 className="page-title capitalize">{monthName}</h1>
              <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} aria-label="Mese precedente" className="btn-ghost !px-3">
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button onClick={handleToday} className="btn-secondary">
                  Oggi
                </button>
                <button onClick={handleNextMonth} aria-label="Mese successivo" className="btn-ghost !px-3">
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
                {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
                  <div key={day} className="label py-2 text-center">
                    {day}
                  </div>
                ))}
              </div>

              {loading ? (
                <div role="status" aria-label="Caricamento" className="grid grid-cols-7 gap-1 sm:gap-2">
                  {Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="skeleton aspect-square" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {days.map((day) => {
                    const dateStr = getDateString(day)
                    const entry = entries[dateStr]
                    const moodColor = getMoodColor(entry?.mood)
                    const isToday = todayStr === dateStr
                    const isSelected = selectedEntry?.date === dateStr

                    return (
                      <button
                        key={day}
                        onClick={() => handleSelectDay(day)}
                        aria-current={isToday ? 'date' : undefined}
                        aria-label={`${day}${entry?.mood ? `, umore ${labelOf(MOODS, entry.mood).toLowerCase()}` : entry ? ', registrato' : ''}`}
                        className={`relative aspect-square rounded-control text-base font-bold tabular-nums transition duration-200 active:scale-[0.95] ${
                          entry ? moodColor : 'text-muted hover:bg-surface'
                        } ${
                          isSelected
                            ? 'ring-2 ring-ink ring-offset-2 ring-offset-bg'
                            : isToday
                              ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg'
                              : ''
                        } ${dateStr > todayStr ? 'opacity-40' : ''}`}
                      >
                        {day}
                        {/* Filled in, but without a mood */}
                        {entry && !entry.mood && (
                          <span aria-hidden="true" className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
                {Object.entries(MOODS).map(([key, { label, color }]) => (
                  <span key={key} className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Entry Details Panel */}
          <div className="lg:col-span-1">
            {selectedEntry ? (
              <div key={selectedEntry.date} className="card animate-rise space-y-6">
                <h2 className="section-title first-letter:uppercase">
                  {new Date(selectedEntry.date).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>

                <div className="divide-y divide-line">
                  {/* Sleep */}
                  {selectedEntry.sleep && (
                    <div className="space-y-2 py-4">
                      <div className="label">Sonno</div>
                      {selectedEntry.sleep.hoursSlept && (
                        <div className="stat text-4xl">
                          {selectedEntry.sleep.hoursSlept}
                          <span className="text-lg font-bold text-faint">h</span>
                        </div>
                      )}
                      <div className="text-sm text-muted">
                        {[
                          selectedEntry.sleep.bedTime && `A letto alle ${selectedEntry.sleep.bedTime}`,
                          selectedEntry.sleep.feeling && `Risveglio: ${labelOf(SLEEP_FEELINGS, selectedEntry.sleep.feeling).toLowerCase()}`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </div>
                  )}

                  {/* Energy */}
                  {selectedEntry.energy && (
                    <div className="space-y-2 py-4">
                      <div className="label">Energia</div>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            ['Mattina', selectedEntry.energy.morning],
                            ['Pomeriggio', selectedEntry.energy.afternoon],
                            ['Sera', selectedEntry.energy.evening],
                          ] as const
                        ).map(
                          ([label, level]) =>
                            level && (
                              <div key={label}>
                                <div className="stat text-3xl">{level}</div>
                                <div className="mt-1 text-xs text-muted">{label}</div>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mood */}
                  {selectedEntry.mood && (
                    <div className="space-y-2 py-4">
                      <div className="label">Umore</div>
                      <div className="text-base font-bold text-ink">{labelOf(MOODS, selectedEntry.mood)}</div>
                    </div>
                  )}

                  {/* Movement */}
                  {selectedEntry.movement && (
                    <div className="space-y-2 py-4">
                      <div className="label">Movimento</div>
                      <div className="text-base font-bold text-ink">
                        {selectedEntry.movement.types
                          ?.map((type) => MOVEMENT_TYPES.find((m) => m.id === type)?.label ?? type)
                          .join(', ')}
                      </div>
                      {selectedEntry.movement.notes && (
                        <div className="text-sm text-muted">{selectedEntry.movement.notes}</div>
                      )}
                    </div>
                  )}

                  {/* Stimulation */}
                  {selectedEntry.stimulation && (
                    <div className="space-y-2 py-4">
                      <div className="label">Stimolazione</div>
                      <div className="text-base font-bold text-ink">
                        {labelOf(STIMULATION_LEVELS, selectedEntry.stimulation)}
                      </div>
                    </div>
                  )}

                  {/* Positive Thing */}
                  {selectedEntry.positiveThing && (
                    <div className="space-y-2 py-4">
                      <div className="label">Una cosa bella</div>
                      <div className="text-base text-ink">{selectedEntry.positiveThing}</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Link
                    href={`/today?date=${selectedEntry.date}`}
                    className="btn-primary w-full"
                  >
                    <Pencil size={18} aria-hidden="true" />
                    Modifica
                  </Link>

                  {deleteConfirm === selectedEntry.date ? (
                    <div className="animate-rise space-y-2">
                      <p role="alert" className="text-sm font-semibold text-danger">
                        Eliminare questo giorno? Non si torna indietro.
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
                      className="btn-danger-quiet w-full"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                      Elimina giorno
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="card state">
                <CalendarDays size={24} className="text-faint" aria-hidden="true" />
                <p className="font-semibold text-ink">Scegli un giorno</p>
                <p>Colorato: già registrato. Vuoto: tocca e compila.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
