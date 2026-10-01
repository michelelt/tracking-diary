'use client'

import { Energy as EnergyData } from '@/lib/validators'

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
    <div className="space-y-1">
      <h2 className="section-title">
        Energia <span className="font-normal text-slate-500">· da 1 (bassa) a 10 (alta)</span>
      </h2>

      {periods.map(({ key, label }) => (
        <label key={key} className="flex min-h-[40px] items-center gap-3">
          <span className="w-20 shrink-0 text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
          <input
            type="range"
            min="1"
            max="10"
            value={value?.[key] || ''}
            onChange={(e) => handleChange(key, parseInt(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-accent dark:bg-slate-700"
          />
          <span className="w-5 shrink-0 text-right text-sm font-semibold tabular-nums text-accent">
            {value?.[key] || '—'}
          </span>
        </label>
      ))}
    </div>
  )
}
