'use client'

import EnergySection from '@/components/EntryForm/EnergySection'
import MoodSection from '@/components/EntryForm/MoodSection'
import MovementSection from '@/components/EntryForm/MovementSection'
import PositiveThingSection from '@/components/EntryForm/PositiveThingSection'
import SleepSection from '@/components/EntryForm/SleepSection'
import StimulationSection from '@/components/EntryForm/StimulationSection'
import Navigation from '@/components/Navigation'
import { localDateString } from '@/lib/dates'
import { Entry } from '@/lib/validators'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

export default function TodayPage() {
  return (
    <Suspense>
      <EntryEditor />
    </Suspense>
  )
}

function EntryEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  // ?date=YYYY-MM-DD opens an existing day for editing
  const isEditing = !!dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
  const today = isEditing ? dateParam : localDateString()

  const defaultFormData: Entry = {
    date: today,
  }

  const [formData, setFormData] = useState<Entry>(defaultFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Load existing entry on mount
  useEffect(() => {
    const loadEntry = async () => {
      try {
        const res = await fetch(`/api/entries?date=${today}`)
        if (res.ok) {
          const data = await res.json()
          if (data.entry) {
            setFormData({
              date: data.entry.date,
              sleep: data.entry.sleep,
              energy: data.entry.energy,
              mood: data.entry.mood,
              movement: data.entry.movement,
              stimulation: data.entry.stimulation,
              positiveThing: data.entry.positiveThing,
            })
          } else {
            setFormData({ date: today })
          }
        }
      } catch (err) {
        console.error('Error loading entry:', err)
      }
    }
    loadEntry()
  }, [today])

  const handleChange = (updates: Partial<Entry>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to save')
      }

      if (isEditing) {
        router.push('/calendar')
        return
      }

      setSaveMessage('✅ Salvato con successo!')
      setFormData(defaultFormData)
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('❌ Errore nel salvataggio')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="page !pb-32">
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Header */}
          <div className="space-y-2">
            {isEditing && (
              <Link
                href="/calendar"
                className="text-sm text-slate-600 hover:underline dark:text-slate-400"
              >
                ← Torna al calendario
              </Link>
            )}
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {isEditing ? 'Modifica giorno' : 'Oggi'}
            </p>
            <h1 className="page-title first-letter:uppercase">
              {new Date(today).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h1>
          </div>

          {/* Sections: one card, one row per metric */}
          <div className="card divide-y divide-slate-200 !p-0 dark:divide-slate-700">
          <div className="p-4">
            <SleepSection
              value={formData.sleep || undefined}
              onChange={(sleep) => handleChange({ sleep })}
            />
          </div>

          <div className="p-4">
            <EnergySection
              value={formData.energy || undefined}
              onChange={(energy) => handleChange({ energy })}
            />
          </div>

          <div className="p-4">
            <MoodSection
              value={formData.mood || undefined}
              onChange={(mood) => handleChange({ mood })}
            />
          </div>

          <div className="p-4">
            <MovementSection
              value={formData.movement || undefined}
              onChange={(movement) => handleChange({ movement })}
            />
          </div>

          <div className="p-4">
            <StimulationSection
              value={formData.stimulation || undefined}
              onChange={(stimulation) => handleChange({ stimulation })}
            />
          </div>

          <div className="p-4">
            <PositiveThingSection
              value={formData.positiveThing || undefined}
              onChange={(positiveThing) => handleChange({ positiveThing })}
            />
          </div>

          </div>

          {/* Hint */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Compila quanto vuoi. Un giorno parziale è meglio di uno saltato.
          </div>
        </div>

        {/* Fixed bottom save button */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-4 shadow-raised backdrop-blur dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto max-w-2xl space-y-3">
            {saveMessage && (
              <div role="status" className={`rounded-lg p-3 text-center text-sm font-medium ${
                saveMessage.includes('✅')
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {saveMessage}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary w-full"
            >
              {isSaving ? 'Salvataggio…' : 'Salva'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
