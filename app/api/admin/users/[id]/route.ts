import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

async function isAdmin(request: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL
  const session = await auth()
  return session?.user?.email === adminEmail
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const action = request.nextUrl.searchParams.get('action') || 'approve'

  if (action === 'approve') {
    const user = await db.allowedUser.update({
      where: { id: params.id },
      data: { approved: true },
    })
    return NextResponse.json(user)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
