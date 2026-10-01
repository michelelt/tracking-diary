'use client'

import { CircleAlert } from 'lucide-react'
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
      if (!res.ok) throw new Error('Utenti non caricati. Ricarica la pagina.')
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Utenti non caricati. Ricarica la pagina.')
    } finally {
      setLoading(false)
    }
  }

  async function approveUser(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Approvazione non riuscita. Riprova.')
      setUsers(users.map(u => (u.id === id ? { ...u, approved: true } : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approvazione non riuscita. Riprova.')
    }
  }

  async function removeUser(id: string) {
    setConfirmId(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })

      if (!res.ok) throw new Error('Rimozione non riuscita. Riprova.')
      setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rimozione non riuscita. Riprova.')
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="page">
          <div role="status" aria-label="Caricamento" className="mx-auto max-w-2xl space-y-8">
            <div className="skeleton h-10 w-40" />
            <div className="skeleton h-40 !rounded-card" />
            <div className="skeleton h-40 !rounded-card" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="page">
        <div className="mx-auto max-w-2xl space-y-8">
          <h1 className="page-title">Utenti</h1>

          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-control bg-danger/10 p-3 text-sm font-semibold text-danger">
              <CircleAlert size={18} className="shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          {[
            { title: 'In attesa', empty: 'Nessuna richiesta. Tutto in ordine.', list: users.filter(u => !u.approved) },
            { title: 'Approvati', empty: 'Ancora nessun utente approvato.', list: users.filter(u => u.approved) },
          ].map(({ title, empty, list }) => (
            <div key={title} className="card">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="section-title">{title}</h2>
                <span className="stat text-3xl">{list.length}</span>
              </div>
              {list.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">{empty}</p>
              ) : (
                <div className="divide-y divide-line">
                  {list.map(user => (
                    <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{user.email}</p>
                        <p className="text-xs tabular-nums text-muted">
                          {new Date(user.createdAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      {confirmId === user.id ? (
                        <div className="flex shrink-0 animate-rise gap-2">
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
                          <button onClick={() => setConfirmId(user.id)} className="btn-danger-quiet">
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
