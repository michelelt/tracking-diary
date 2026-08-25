'use client'

interface SaveIndicatorProps {
  state: 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
}

export default function SaveIndicator({ state }: SaveIndicatorProps) {
  const messages = {
    idle: null,
    unsaved: 'Non salvato',
    saving: 'Salvataggio...',
    saved: 'Salvato',
    error: 'Errore nel salvataggio',
  }

  const colors = {
    idle: '',
    unsaved: 'text-slate-500 dark:text-slate-400',
    saving: 'text-slate-600 dark:text-slate-300 animate-pulse',
    saved: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2">
      {state !== 'idle' && (
        <div className={`text-sm font-medium ${colors[state]}`}>
          {messages[state]}
        </div>
      )}
      {state === 'saving' && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-accent dark:border-slate-600 dark:border-t-accent" />
      )}
    </div>
  )
}
