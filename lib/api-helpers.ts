import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { db } from './db'

export async function requireAuth() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  return session
}

export async function requireAuthUser() {
  const session = await requireAuth()

  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) {
    return { error: NextResponse.json({ error: 'User not found' }, { status: 404 }) }
  }

  return { session, user }
}

export async function verifyUserAccess(userId: string, sessionUserId: string) {
  if (userId !== sessionUserId) {
    return false
  }
  return true
}

export function verifyAdminSession(adminToken: string): boolean {
  const token = adminToken.split(' ')[1]
  // Token verification will be handled in admin routes
  return !!token
}
