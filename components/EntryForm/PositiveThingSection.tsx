'use client'

interface PositiveThingSectionProps {
  value?: string
  onChange: (text: string) => void
}

export default function PositiveThingSection({ value, onChange }: PositiveThingSectionProps) {
  const charCount = value?.length || 0
  const maxChars = 200

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">✨ Una cosa bella</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Qualcosa di bello che ti è successo oggi
      </p>

      <div className="relative">
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
          placeholder="Es. Ho mangiato bene, ho passato del tempo con la famiglia..."
          rows={3}
          className="input-field resize-none text-sm"
        />
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-right">
          {charCount}/{maxChars}
        </div>
      </div>
    </div>
  )
}
