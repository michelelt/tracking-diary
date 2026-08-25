'use client'

import { MOODS } from '@/lib/constants'

interface MoodSectionProps {
  value?: string | null
  onChange: (mood: 'basso' | 'neutro' | 'buono' | 'molto_buono') => void
}

export default function MoodSection({ value, onChange }: MoodSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">😊 Umore</h2>

      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(MOODS) as Array<['basso' | 'neutro' | 'buono' | 'molto_buono', any]>).map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`chip ${value === key ? 'chip-selected' : 'chip-unselected'}`}
          >
            <span className="mr-1 text-lg">{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
