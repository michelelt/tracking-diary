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
import { ArrowLeft, Check, CircleAlert } from 'lucide-react'
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
        // Demo limits come with a message for the visitor
        const data = await res.json().catch(() => null)
        throw new Error(data?.demo ? data.error : '')
      }

      if (isEditing) {
        router.push('/calendar')
        return
      }

      setSaveMessage('✅ Giornata salvata. Continua così!')
      setFormData(defaultFormData)
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage(`❌ ${(error instanceof Error && error.message) || 'Non salvato. Riprova.'}`)
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saved = saveMessage.includes('✅')

  return (
    <>
      <Navigation />
      <div className="page !pb-48 md:!pb-32">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="space-y-2">
            {isEditing && (
              <Link
                href="/calendar"
                className="-ml-2 inline-flex min-h-[44px] items-center gap-2 px-2 text-sm font-semibold text-muted transition-colors duration-200 hover:text-ink"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                Calendario
              </Link>
            )}
            <p className="label">{isEditing ? 'Modifica giorno' : 'Oggi'}</p>
            <h1 className="page-title first-letter:uppercase">
              {new Date(today).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h1>
          </div>

          {/* Sections: one row per metric, split by hairlines */}
          <div className="mt-4 divide-y divide-line">
            <div className="py-6">
              <SleepSection
                value={formData.sleep || undefined}
                onChange={(sleep) => handleChange({ sleep })}
              />
            </div>
            <div className="py-6">
              <EnergySection
                value={formData.energy || undefined}
                onChange={(energy) => handleChange({ energy })}
              />
            </div>
            <div className="py-6">
              <MoodSection
                value={formData.mood || undefined}
                onChange={(mood) => handleChange({ mood })}
              />
            </div>
            <div className="py-6">
              <MovementSection
                value={formData.movement || undefined}
                onChange={(movement) => handleChange({ movement })}
              />
            </div>
            <div className="py-6">
              <StimulationSection
                value={formData.stimulation || undefined}
                onChange={(stimulation) => handleChange({ stimulation })}
              />
            </div>
            <div className="py-6">
              <PositiveThingSection
                value={formData.positiveThing || undefined}
                onChange={(positiveThing) => handleChange({ positiveThing })}
              />
            </div>
          </div>

          {/* Hint */}
          <p className="pt-2 text-center text-sm text-muted">
            Anche un giorno a metà conta. Segna quello che hai.
          </p>
        </div>

        {/* Fixed save button, above the mobile tab bar */}
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 bg-gradient-to-t from-bg from-70% to-transparent px-4 pb-3 pt-6 md:bottom-0 md:pb-6">
          <div className="mx-auto max-w-2xl space-y-3">
            {saveMessage && (
              <div
                role="status"
                className={`flex animate-pop items-center justify-center gap-2 rounded-control p-3 text-sm font-semibold ${
                  saved ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}
              >
                {saved ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : <CircleAlert size={18} aria-hidden="true" />}
                {saveMessage.slice(2)}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary w-full text-base"
            >
              {isSaving ? 'Salvo…' : 'Salva giornata'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
