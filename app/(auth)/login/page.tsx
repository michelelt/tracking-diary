import { Suspense } from 'react'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-sm">
          <div className="card">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Baseline</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Caricamento...
              </p>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
