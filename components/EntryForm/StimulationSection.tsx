'use client'

import { STIMULATION_LEVELS } from '@/lib/constants'

interface StimulationSectionProps {
  value?: string | null
  onChange: (level: 'poco' | 'normale' | 'tanto' | 'troppo') => void
}

export default function StimulationSection({ value, onChange }: StimulationSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">📱 Stimolazione</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Quanto tempo davanti agli schermi/scroll?
      </p>

      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(STIMULATION_LEVELS) as Array<['poco' | 'normale' | 'tanto' | 'troppo', any]>).map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`chip ${value === key ? 'chip-selected' : 'chip-unselected'}`}
          >
            <span className="mr-1">{emoji}</span> {label}
          </button>
        ))}
      </div>
    </div>
  )
}
