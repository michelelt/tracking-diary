import { requireAdmin } from '@/lib/api-helpers'
import { db } from '@/lib/db'
import { DEMO_EMAIL } from '@/lib/demo'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const error = await requireAdmin()
  if (error) return error

  // The demo user never belongs in this list: its access doesn't depend on it
  const users = await db.allowedUser.findMany({
    where: { email: { not: DEMO_EMAIL } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const error = await requireAdmin()
  if (error) return error

  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    // Added by the admin: no approval step needed
    const user = await db.allowedUser.create({
      data: { email, approved: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    throw error
  }
}

export async function DELETE(req: NextRequest) {
  const error = await requireAdmin()
  if (error) return error

  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  await db.allowedUser.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
