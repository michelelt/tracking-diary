'use client'

import Navigation from '@/components/Navigation'
import { Entry } from '@/lib/validators'
import { useState, useEffect } from 'react'

interface ExtendedEntry extends Entry {
  id: string
  createdAt: string
  updatedAt: string
}

export default function RecordsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<Record<string, ExtendedEntry>>({})
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<ExtendedEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Fetch entries for the current month
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/entries/month?year=${year}&month=${month + 1}`)
        if (res.ok) {
          const data = await res.json()
          const entriesMap: Record<string, ExtendedEntry> = {}
          data.entries?.forEach((entry: ExtendedEntry) => {
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
    setSelectedEntry(entries[dateStr] || null)
    setIsEditing(false)
    setDeleteConfirm(null)
  }

  const handleDelete = async (dateStr: string) => {
    try {
      // We would need to add a DELETE endpoint
      // For now, create an empty entry to "delete"
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
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900 pb-24">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 capitalize">
                  📋 I Miei Record - {monthName}
                </h1>
              </div>

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
                  <div className="grid grid-cols-7 gap-2 mb-2">
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
                  <div className="grid grid-cols-7 gap-2">
                    {emptyDays.map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {days.map((day) => {
                      const dateStr = getDateString(day)
                      const hasEntry = dateStr in entries
                      const isToday = getTodayString() === dateStr
                      const isSelected = selectedEntry?.date === dateStr

                      return (
                        <button
                          key={day}
                          onClick={() => handleSelectDay(day)}
                          className={`aspect-square p-2 rounded text-center text-sm font-semibold transition-all ${
                            hasEntry
                              ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 cursor-pointer hover:bg-green-200 dark:hover:bg-green-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          } ${
                            isToday
                              ? 'ring-2 ring-blue-500'
                              : ''
                          } ${
                            isSelected
                              ? 'ring-2 ring-purple-500'
                              : ''
                          }`}
                        >
                          <div>{day}</div>
                          {hasEntry && <div className="text-xs">✓</div>}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Entry Details / Edit Panel */}
          <div className="lg:col-span-1">
            {selectedEntry ? (
              <div className="card space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Dettagli
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    {isEditing ? '✓ Fatto' : '✏️ Modifica'}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    📅 {new Date(selectedEntry.date).toLocaleDateString('it-IT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>

                  {/* Sleep */}
                  {selectedEntry.sleep && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                        😴 Sonno
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
                        ⚡ Energia
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
                        😊 Mood
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
                        🏃 Movimento
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
                        📵 Stimolazione
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
                        ✨ Cosa Positiva
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedEntry.positiveThing}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <button
                    onClick={() => {
                      // TODO: Implement edit functionality
                      alert('Modifica disponibile a breve!')
                    }}
                    className="w-full px-4 py-2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 font-medium"
                  >
                    ✏️ Modifica Completo
                  </button>

                  {deleteConfirm === selectedEntry.date ? (
                    <div className="space-y-2">
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Sei sicuro? Non si può annullare!
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleDelete(selectedEntry.date)
                          }
                          className="flex-1 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium"
                        >
                          🗑️ Elimina
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-600 font-medium"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(selectedEntry.date)}
                      className="w-full px-4 py-2 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800 font-medium"
                    >
                      🗑️ Elimina Record
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="card text-center py-8 text-slate-500 dark:text-slate-400">
                <p>Seleziona un giorno dal calendario</p>
                <p className="text-sm mt-2">I giorni con ✓ hanno un record</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
