import { requireAdmin } from '@/lib/api-helpers'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Approve a pending user
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const error = await requireAdmin()
  if (error) return error

  const { id } = await params
  const user = await db.allowedUser.update({
    where: { id },
    data: { approved: true },
  })

  return NextResponse.json(user)
}
