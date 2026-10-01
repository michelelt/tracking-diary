'use client'

import { MOODS } from '@/lib/constants'

interface MoodSectionProps {
  value?: string | null
  onChange: (mood: 'basso' | 'neutro' | 'buono' | 'molto_buono') => void
}

export default function MoodSection({ value, onChange }: MoodSectionProps) {
  return (
    <div className="space-y-2">
      <h2 className="section-title">Umore</h2>

      <div className="segmented">
        {(Object.entries(MOODS) as Array<['basso' | 'neutro' | 'buono' | 'molto_buono', any]>).map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-pressed={value === key}
            className={`segment !justify-start !pt-1.5 ${value === key ? 'segment-selected' : ''}`}
          >
            <span aria-hidden="true" className="text-base">{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
