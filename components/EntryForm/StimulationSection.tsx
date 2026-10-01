'use client'

import { STIMULATION_LEVELS } from '@/lib/constants'

interface StimulationSectionProps {
  value?: string | null
  onChange: (level: 'poco' | 'normale' | 'tanto' | 'troppo') => void
}

export default function StimulationSection({ value, onChange }: StimulationSectionProps) {
  return (
    <div className="space-y-2">
      <h2 className="section-title">
        Stimolazione <span className="font-normal text-slate-500">· tempo su schermi e scroll</span>
      </h2>

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
