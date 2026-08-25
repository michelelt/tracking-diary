'use client'

import { EnergyData } from '@/lib/types'

interface EnergySectionProps {
  value?: EnergyData
  onChange: (energy: EnergyData) => void
}

export default function EnergySection({ value, onChange }: EnergySectionProps) {
  const periods = [
    { key: 'morning' as const, label: 'Mattina', emoji: '🌅' },
    { key: 'afternoon' as const, label: 'Pomeriggio', emoji: '☀️' },
    { key: 'evening' as const, label: 'Sera', emoji: '🌙' },
  ]

  const handleChange = (period: 'morning' | 'afternoon' | 'evening', level: number) => {
    onChange({
      ...value,
      [period]: level,
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">⚡ Energia</h2>

      {periods.map(({ key, label, emoji }) => (
        <div key={key}>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              <span className="mr-2">{emoji}</span> {label}
            </label>
            <span className="text-lg font-bold text-accent">
              {value?.[key] || '—'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={value?.[key] || ''}
            onChange={(e) => handleChange(key, parseInt(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-accent dark:bg-slate-700"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Bassa</span>
            <span>Alta</span>
          </div>
        </div>
      ))}
    </div>
  )
}
