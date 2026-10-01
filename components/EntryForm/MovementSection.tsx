'use client'

import { MOVEMENT_TYPES } from '@/lib/constants'
import { Movement as MovementData } from '@/lib/validators'

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
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="section-title">Movimento</h2>
        <span className="label">Anche più di uno</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MOVEMENT_TYPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => toggleType(id as 'palestra' | 'nuoto' | 'altro' | 'niente')}
            aria-pressed={types.includes(id as 'palestra' | 'nuoto' | 'altro' | 'niente')}
            className={`chip ${types.includes(id as 'palestra' | 'nuoto' | 'altro' | 'niente') ? 'chip-selected' : 'chip-unselected'}`}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Cosa hai fatto? (es. 30 min)"
        aria-label="Note sul movimento"
        value={value?.notes || ''}
        onChange={(e) => handleNotesChange(e.target.value)}
        maxLength={100}
        className="input-field"
      />
    </div>
  )
}
