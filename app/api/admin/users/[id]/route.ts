import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

async function isAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL
  const session = await auth()
  return session?.user?.email === adminEmail
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const action = request.nextUrl.searchParams.get('action') || 'approve'

  if (action === 'approve') {
    const user = await db.allowedUser.update({
      where: { id },
      data: { approved: true },
    })
    return NextResponse.json(user)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
