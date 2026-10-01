'use client'

import { MOVEMENT_TYPES } from '@/lib/constants'
import { MovementData } from '@/lib/types'

interface MovementSectionProps {
  value?: MovementData
  onChange: (movement: MovementData) => void
}

export default function MovementSection({ value, onChange }: MovementSectionProps) {
  const types = (value?.types || []) as ('palestra' | 'nuoto' | 'altro' | 'niente')[]

  const toggleType = (type: 'palestra' | 'nuoto' | 'altro' | 'niente') => {
    let newTypes: ('palestra' | 'nuoto' | 'altro' | 'niente')[]
    if (types.includes(type)) {
      newTypes = types.filter((t) => t !== type)
    } else {
      newTypes = [...types, type]
    }
    onChange({ ...value, types: newTypes })
  }

  const handleNotesChange = (notes: string) => {
    onChange({ ...value, notes })
  }

  return (
    <div className="space-y-2">
      <h2 className="section-title">
        Movimento <span className="font-normal text-slate-500">· anche più di uno</span>
      </h2>

      <div className="grid grid-cols-4 gap-1.5">
        {MOVEMENT_TYPES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => toggleType(id as 'palestra' | 'nuoto' | 'altro' | 'niente')}
            aria-pressed={types.includes(id as 'palestra' | 'nuoto' | 'altro' | 'niente')}
            className={`chip !px-1 text-xs ${types.includes(id as 'palestra' | 'nuoto' | 'altro' | 'niente') ? 'chip-selected' : 'chip-unselected'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Note brevi (es. 30 min)"
        value={value?.notes || ''}
        onChange={(e) => handleNotesChange(e.target.value)}
        maxLength={100}
        className="input-field text-sm"
      />
    </div>
  )
}
