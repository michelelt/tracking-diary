'use client'

import { DEMO_DISCLAIMER } from '@/lib/demo'
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

  const handleDemo = async () => {
    setIsLoading(true)
    await signIn('demo', { callbackUrl: '/today' })
  }

  return (
    <main className="relative flex min-h-screen flex-col justify-center bg-bg px-6">
      <div className="mx-auto w-full max-w-sm">
        <span aria-hidden="true" className="block h-1.5 w-12 rounded-full bg-accent" />
        <h1 className="mt-6 text-6xl font-black tracking-tight text-ink">How Are You</h1>
        <p className="mt-4 text-lg text-muted">Sei metriche. Due minuti. Ogni giorno.</p>

        <button onClick={handleSignIn} disabled={isLoading} className="btn-primary mt-12 w-full text-base">
          {isLoading ? 'Accesso…' : 'Entra con Google'}
        </button>

        <p className="mt-4 text-sm text-muted">
          Primo accesso? La richiesta va all&apos;admin per l&apos;approvazione.
        </p>

        <button onClick={handleDemo} disabled={isLoading} className="btn-secondary mt-8 w-full text-base">
          Prova la demo
        </button>
        <p className="mt-2 text-sm text-muted">{DEMO_DISCLAIMER}</p>
      </div>

      <footer className="absolute inset-x-0 bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-center text-[10px] text-muted">
        created with ❤️ for O.
      </footer>
    </main>
  )
}
