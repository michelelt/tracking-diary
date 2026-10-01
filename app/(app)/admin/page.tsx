'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'

interface AllowedUser {
  id: string
  email: string
  approved: boolean
  createdAt: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<AllowedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  // Access is enforced by middleware.ts and by the admin API routes
  useEffect(() => {
    loadUsers()
  }, [])

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

  async function approveUser(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to approve user')
      setUsers(users.map(u => (u.id === id ? { ...u, approved: true } : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error approving user')
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

  if (loading) {
    return <div className="state" role="status">Caricamento…</div>
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

          {[
            { title: 'Richieste in attesa', empty: 'Nessuna richiesta in attesa', list: users.filter(u => !u.approved) },
            { title: 'Utenti approvati', empty: 'Nessun utente approvato', list: users.filter(u => u.approved) },
          ].map(({ title, empty, list }) => (
            <div key={title} className="card">
              <h2 className="mb-3 text-base font-semibold text-slate-900">
                {title} ({list.length})
              </h2>
              {list.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">{empty}</p>
              ) : (
                <div className="divide-y divide-slate-200">
                  {list.map(user => (
                    <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
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
                        <div className="flex shrink-0 gap-2">
                          {!user.approved && (
                            <button onClick={() => approveUser(user.id)} className="btn-primary">
                              Approva
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmId(user.id)}
                            className="btn text-red-700 hover:bg-red-50"
                          >
                            {user.approved ? 'Rimuovi' : 'Rifiuta'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
