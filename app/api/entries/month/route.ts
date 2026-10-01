import { requireAuthUser } from '@/lib/api-helpers'
import { toDateString } from '@/lib/dates'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthUser()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') || '')
  const month = parseInt(searchParams.get('month') || '')
  if (!year || !(month >= 1 && month <= 12)) {
    return NextResponse.json({ error: 'Year and month are required' }, { status: 400 })
  }

  // Dates are stored at UTC midnight
  const entries = await db.entry.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lte: new Date(Date.UTC(year, month, 0)),
      },
    },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json({
    entries: entries.map((entry) => ({ ...entry, date: toDateString(entry.date) })),
  })
}
