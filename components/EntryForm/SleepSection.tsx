'use client'

import { SLEEP_FEELINGS } from '@/lib/constants'
import { calculateHoursSlept } from '@/lib/calculations'
import { SleepData } from '@/lib/types'
import { useState } from 'react'

interface SleepSectionProps {
  value?: SleepData
  onChange: (sleep: SleepData) => void
}

export default function SleepSection({ value, onChange }: SleepSectionProps) {
  const [showTimes, setShowTimes] = useState(!!value?.bedTime)

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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">😴 Sonno</h2>

      {!showTimes ? (
        <button
          onClick={() => setShowTimes(true)}
          className="chip chip-unselected w-full justify-center"
        >
          Aggiungi orari
        </button>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                A letto
              </label>
              <input
                type="time"
                value={value?.bedTime || ''}
                onChange={(e) => handleTimeChange('bedTime', e.target.value)}
                className="input-field text-sm"
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
                className="input-field text-sm"
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
                className="input-field text-sm"
              />
            </div>
          </div>

          {value?.hoursSlept && (
            <div className="rounded-lg bg-accent/10 p-3 text-sm font-medium text-accent dark:bg-accent/20">
              {value.hoursSlept}h dormite
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Come ti senti al risveglio?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(SLEEP_FEELINGS) as Array<[string, any]>).map(([key, { label, emoji }]) => (
            <button
              key={key}
              onClick={() => handleFeelingChange(key as any)}
              className={`chip ${value?.feeling === key ? 'chip-selected' : 'chip-unselected'}`}
            >
              <span className="mr-1">{emoji}</span> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
