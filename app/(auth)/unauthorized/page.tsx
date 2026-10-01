'use client'

import { Lock } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-bg px-6">
      <div className="mx-auto w-full max-w-sm">
        <Lock size={32} className="text-muted" aria-hidden="true" />
        <h1 className="page-title mt-6">Accesso non attivo</h1>
        <p className="mt-4 text-lg text-muted">
          Il tuo account Google non è ancora approvato per How Are You.
        </p>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn-primary mt-12 w-full text-base"
        >
          Torna al login
        </button>

        <p className="mt-4 text-sm text-muted">
          Pensi sia un errore? Scrivi all&apos;amministratore.
        </p>
      </div>
    </main>
  )
}
