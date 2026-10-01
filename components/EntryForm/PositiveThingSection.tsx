'use client'

interface PositiveThingSectionProps {
  value?: string
  onChange: (text: string) => void
}

export default function PositiveThingSection({ value, onChange }: PositiveThingSectionProps) {
  const charCount = value?.length || 0
  const maxChars = 200

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="section-title">
          Una cosa bella <span className="font-normal text-slate-500">· di oggi</span>
        </h2>
        <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {charCount}/{maxChars}
        </span>
      </div>

      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
        placeholder="Es. Ho mangiato bene, ho passato del tempo con la famiglia..."
        rows={2}
        aria-label="Una cosa bella di oggi"
        className="input-field resize-none text-sm"
      />
    </div>
  )
}
