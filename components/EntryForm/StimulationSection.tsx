'use client'

import { STIMULATION_LEVELS } from '@/lib/constants'

interface StimulationSectionProps {
  value?: string | null
  onChange: (level: 'poco' | 'normale' | 'tanto' | 'troppo') => void
}

export default function StimulationSection({ value, onChange }: StimulationSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="section-title">Stimolazione</h2>
        <span className="label">Schermi e scroll</span>
      </div>

      <div className="segmented">
        {(Object.entries(STIMULATION_LEVELS) as Array<['poco' | 'normale' | 'tanto' | 'troppo', any]>).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-pressed={value === key}
            className={`segment ${value === key ? 'segment-selected' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
