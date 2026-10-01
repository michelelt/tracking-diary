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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="section-title">Sonno</h2>
        {value?.hoursSlept && (
          <span className="text-xs font-medium tabular-nums text-accent">{value.hoursSlept}h dormite</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                A letto
              </label>
              <input
                type="time"
                value={value?.bedTime || ''}
                onChange={(e) => handleTimeChange('bedTime', e.target.value)}
                className="input-field !px-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Addormentato
              </label>
              <input
                type="time"
                value={value?.fallAsleepTime || ''}
                onChange={(e) => handleTimeChange('fallAsleepTime', e.target.value)}
                className="input-field !px-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Sveglio
              </label>
              <input
                type="time"
                value={value?.wakeUpTime || ''}
                onChange={(e) => handleTimeChange('wakeUpTime', e.target.value)}
                className="input-field !px-2 text-sm"
              />
            </div>
      </div>

      <p className="pt-1 text-xs font-medium text-slate-600 dark:text-slate-400">Come ti senti al risveglio?</p>
      <div className="segmented">
        {(Object.entries(SLEEP_FEELINGS) as Array<[string, any]>).map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => handleFeelingChange(key as any)}
            aria-pressed={value?.feeling === key}
            className={`segment ${value?.feeling === key ? 'segment-selected' : ''}`}
          >
            <span aria-hidden="true" className="text-base">{emoji}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
