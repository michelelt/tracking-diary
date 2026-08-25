'use client'

import EnergySection from '@/components/EntryForm/EnergySection'
import MoodSection from '@/components/EntryForm/MoodSection'
import MovementSection from '@/components/EntryForm/MovementSection'
import PositiveThingSection from '@/components/EntryForm/PositiveThingSection'
import SleepSection from '@/components/EntryForm/SleepSection'
import StimulationSection from '@/components/EntryForm/StimulationSection'
import Navigation from '@/components/Navigation'
import { Entry } from '@/lib/validators'
import { useEffect, useState } from 'react'

export default function TodayPage() {
  const today = new Date().toISOString().split('T')[0]

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
      // Ensure date is in YYYY-MM-DD format (not datetime)
      const formatDateString = (date: unknown): string => {
        if (date instanceof Date) {
          return date.toISOString().split('T')[0]
        }
        if (typeof date === 'string') {
          return date.includes('T') ? date.split('T')[0] : date
        }
        return String(date)
      }

      const dataToSave = {
        ...formData,
        date: formatDateString(formData.date),
      }

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })

      if (!res.ok) {
        throw new Error('Failed to save')
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
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900 pb-24">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              📝 {new Date(today).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h1>
          </div>

          {/* Sections */}
          <div className="card">
            <SleepSection
              value={formData.sleep || undefined}
              onChange={(sleep) => handleChange({ sleep })}
            />
          </div>

          <div className="card">
            <EnergySection
              value={formData.energy || undefined}
              onChange={(energy) => handleChange({ energy })}
            />
          </div>

          <div className="card">
            <MoodSection
              value={formData.mood || undefined}
              onChange={(mood) => handleChange({ mood })}
            />
          </div>

          <div className="card">
            <MovementSection
              value={formData.movement || undefined}
              onChange={(movement) => handleChange({ movement })}
            />
          </div>

          <div className="card">
            <StimulationSection
              value={formData.stimulation || undefined}
              onChange={(stimulation) => handleChange({ stimulation })}
            />
          </div>

          <div className="card">
            <PositiveThingSection
              value={formData.positiveThing || undefined}
              onChange={(positiveThing) => handleChange({ positiveThing })}
            />
          </div>

          {/* Hint */}
          <div className="text-center py-4 text-sm text-slate-500 dark:text-slate-400">
            Compila quanto vuoi. Un giorno parziale è meglio di uno saltato.
          </div>
        </div>

        {/* Fixed bottom save button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 safe-bottom">
          <div className="mx-auto max-w-2xl space-y-3">
            {saveMessage && (
              <div className={`p-3 rounded text-center text-sm font-medium ${
                saveMessage.includes('✅')
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {saveMessage}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary w-full"
            >
              {isSaving ? '💾 Salvataggio...' : '💾 Salva'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
