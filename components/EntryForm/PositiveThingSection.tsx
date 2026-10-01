'use client'

interface PositiveThingSectionProps {
  value?: string
  onChange: (text: string) => void
}

export default function PositiveThingSection({ value, onChange }: PositiveThingSectionProps) {
  const charCount = value?.length || 0
  const maxChars = 200

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="section-title">Una cosa bella</h2>
        <span className="label tabular-nums">
          {charCount}/{maxChars}
        </span>
      </div>

      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
        placeholder="Il momento migliore di oggi"
        rows={2}
        aria-label="Una cosa bella di oggi"
        className="input-field resize-none"
      />
    </div>
  )
}
