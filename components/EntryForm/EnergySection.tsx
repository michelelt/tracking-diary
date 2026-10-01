'use client'

import { Energy as EnergyData } from '@/lib/validators'
import { Moon, Sun, Sunrise } from 'lucide-react'

interface EnergySectionProps {
  value?: EnergyData
  onChange: (energy: EnergyData) => void
}

export default function EnergySection({ value, onChange }: EnergySectionProps) {
  const periods = [
    { key: 'morning' as const, label: 'Mattina', icon: Sunrise },
    { key: 'afternoon' as const, label: 'Pomeriggio', icon: Sun },
    { key: 'evening' as const, label: 'Sera', icon: Moon },
  ]

  const handleChange = (period: 'morning' | 'afternoon' | 'evening', level: number) => {
    onChange({
      ...value,
      [period]: level,
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="section-title">Energia</h2>
        <span className="label">Da 1 a 10</span>
      </div>

      {periods.map(({ key, label, icon: Icon }) => (
        <label key={key} className="flex min-h-[48px] items-center gap-3">
          <span className="flex w-28 shrink-0 items-center gap-2 text-sm font-medium text-muted">
            <Icon size={18} aria-hidden="true" />
            {label}
          </span>
          <input
            type="range"
            min="1"
            max="10"
            value={value?.[key] || ''}
            onChange={(e) => handleChange(key, parseInt(e.target.value))}
            // Unset sliders stay gray so the default thumb position doesn't read as a value
            className={`h-2 w-full cursor-pointer appearance-none rounded-full bg-raised ${value?.[key] ? 'accent-accent-strong' : 'accent-faint'}`}
          />
          <span className={`stat w-8 shrink-0 text-right text-2xl ${value?.[key] ? '' : '!text-faint'}`}>
            {value?.[key] || '–'}
          </span>
        </label>
      ))}
    </div>
  )
}
