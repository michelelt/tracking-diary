import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { isAdminEmail, isAllowedEmail } from './auth'
import { db } from './db'

// The signed-in, approved user, or the error response to return
export async function requireAuthUser() {
  const email = (await auth())?.user?.email

  if (!email) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // Checked on every request: a session outlives a revoked approval
  if (!(await isAllowedEmail(email))) {
    return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  const user = await db.user.findUnique({ where: { email } })

  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'User not found' }, { status: 404 }) }
  }

  return { user, error: null }
}

// The error response to return, or null for the admin
export async function requireAdmin() {
  const session = await auth()
  return isAdminEmail(session?.user?.email) ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
