'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function LoginForm() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const callbackUrl = searchParams.get('callbackUrl') || '/today'

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn('google', { callbackUrl })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-sm">
        <div className="card">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Baseline</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Traccia le tue metriche personali, 2 minuti al giorno
            </p>
          </div>

          <button onClick={handleSignIn} disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Accesso in corso...' : 'Accedi con Google'}
          </button>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Se non sei ancora registrato, la tua richiesta sarà inviata all&apos;admin per l&apos;approvazione.
          </p>
        </div>
      </div>
    </div>
  )
}
