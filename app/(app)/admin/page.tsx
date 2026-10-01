'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface AllowedUser {
  id: string
  email: string
  createdAt: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<AllowedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user?.email !== adminEmail) {
      router.push('/today')
      return
    }

    if (status === 'authenticated') {
      loadUsers()
    }
  }, [status, session, router, adminEmail])

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users')
    } finally {
      setLoading(false)
    }
  }

  async function removeUser(id: string) {
    setConfirmId(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })

      if (!res.ok) throw new Error('Failed to remove user')
      setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing user')
    }
  }

  if (status === 'loading' || loading) {
    return <div className="state" role="status">Caricamento…</div>
  }

  if (session?.user?.email !== adminEmail) {
    return null
  }

  return (
    <>
      <Navigation />
      <div className="page">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="page-title">Utenti</h1>

          {error && (
            <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="card">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Utenti registrati ({users.length})</h2>
            {users.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Nessun utente registrato</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    {confirmId === user.id ? (
                      <div className="flex shrink-0 gap-2">
                        <button onClick={() => removeUser(user.id)} className="btn-danger">
                          Conferma
                        </button>
                        <button onClick={() => setConfirmId(null)} className="btn-secondary">
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(user.id)}
                        className="btn shrink-0 text-red-700 hover:bg-red-50"
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
