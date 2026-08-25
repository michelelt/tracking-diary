'use client'

import { signOut } from 'next-auth/react'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-sm">
        <div className="card">
          <div className="mb-8 text-center">
            <div className="mb-4 text-5xl">🔒</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Accesso non autorizzato
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Il tuo account Google non è stato autorizzato per accedere a Baseline.
            </p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn-primary w-full"
          >
            Torna al login
          </button>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Se ritieni sia un errore, contatta l&apos;amministratore.
          </p>
        </div>
      </div>
    </div>
  )
}
