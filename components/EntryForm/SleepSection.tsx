'use client'

import { SLEEP_FEELINGS } from '@/lib/constants'
import { calculateHoursSlept } from '@/lib/calculations'
import { Sleep as SleepData } from '@/lib/validators'

interface SleepSectionProps {
  value?: SleepData
  onChange: (sleep: SleepData) => void
}

export default function SleepSection({ value, onChange }: SleepSectionProps) {
  const handleTimeChange = (field: 'bedTime' | 'fallAsleepTime' | 'wakeUpTime', time: string) => {
    const updated = { ...value, [field]: time }

    // Auto-calculate hours if both bed time and wake up time are set
    if (updated.bedTime && updated.wakeUpTime && field !== 'fallAsleepTime') {
      updated.hoursSlept = calculateHoursSlept(updated.bedTime, updated.wakeUpTime)
    }

    onChange(updated as SleepData)
  }

  const handleFeelingChange = (feeling: 'male' | 'così_così' | 'bene' | 'benissimo') => {
    onChange({ ...value, feeling } as SleepData)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <h2 className="section-title">Sonno</h2>
        {value?.hoursSlept && (
          <p className="flex items-baseline gap-1.5">
            <span className="stat text-4xl">{value.hoursSlept}</span>
            <span className="label">ore dormite</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="space-y-1">
          <span className="label block truncate">A letto</span>
          <input
            type="time"
            value={value?.bedTime || ''}
            onChange={(e) => handleTimeChange('bedTime', e.target.value)}
            className="input-field !px-2 text-center font-semibold tabular-nums"
          />
        </label>
        <label className="space-y-1">
          <span className="label block truncate">Addormentato</span>
          <input
            type="time"
            value={value?.fallAsleepTime || ''}
            onChange={(e) => handleTimeChange('fallAsleepTime', e.target.value)}
            className="input-field !px-2 text-center font-semibold tabular-nums"
          />
        </label>
        <label className="space-y-1">
          <span className="label block truncate">Sveglio</span>
          <input
            type="time"
            value={value?.wakeUpTime || ''}
            onChange={(e) => handleTimeChange('wakeUpTime', e.target.value)}
            className="input-field !px-2 text-center font-semibold tabular-nums"
          />
        </label>
      </div>

      <p className="label pt-2">Al risveglio</p>
      <div className="segmented">
        {(Object.entries(SLEEP_FEELINGS) as Array<[string, any]>).map(([key, { label, icon: Icon }]) => (
          <button
            key={key}
            onClick={() => handleFeelingChange(key as any)}
            aria-pressed={value?.feeling === key}
            className={`segment ${value?.feeling === key ? 'segment-selected' : ''}`}
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
