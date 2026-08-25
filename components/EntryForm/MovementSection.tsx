'use client'

import { MOVEMENT_TYPES } from '@/lib/constants'
import { MovementData } from '@/lib/types'

interface MovementSectionProps {
  value?: MovementData
  onChange: (movement: MovementData) => void
}

export default function MovementSection({ value, onChange }: MovementSectionProps) {
  const types = value?.types || []

  const toggleType = (type: string) => {
    let newTypes: string[]
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">🏃 Movimento</h2>

      <div className="grid grid-cols-2 gap-2">
        {MOVEMENT_TYPES.map(({ id, label, emoji }) => (
          <button
            key={id}
            onClick={() => toggleType(id)}
            className={`chip ${types.includes(id) ? 'chip-selected' : 'chip-unselected'}`}
          >
            <span className="mr-1">{emoji}</span> {label}
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
