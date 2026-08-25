import { auth } from '@/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1 + '')

    // Create start and end dates for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const entries = await db.entry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        mood: true,
      },
    })

    // Format entries with date as YYYY-MM-DD string
    const formattedEntries = entries.map((entry) => ({
      date: entry.date.toISOString().split('T')[0],
      mood: entry.mood,
    }))

    return NextResponse.json({ entries: formattedEntries })
  } catch (error) {
    console.error('[GET /api/entries/month] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entries', details: String(error) },
      { status: 500 }
    )
  }
}
