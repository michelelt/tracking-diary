'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
    if (!confirm('Rimuovi questo utente?')) return

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
    return <div className="p-4">Caricamento...</div>
  }

  if (session?.user?.email !== adminEmail) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin - Utenti</h1>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      <div>
        <h2 className="font-semibold text-lg mb-3">Utenti registrati ({users.length})</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">Nessun utente</p>
        ) : (
          <div className="space-y-2">
            {users.map(user => (
              <div
                key={user.id}
                className="flex justify-between items-center p-3 border rounded"
              >
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => removeUser(user.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
