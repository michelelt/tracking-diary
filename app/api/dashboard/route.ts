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

    // ?from=YYYY-MM-DD limits the entries; omitted means all history
    const from = new URL(req.url).searchParams.get('from')
    const fromDate = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? new Date(from + 'T00:00:00Z') : null

    const entries = await db.entry.findMany({
      where: {
        userId: user.id,
        ...(fromDate ? { date: { gte: fromDate } } : {}),
      },
      orderBy: { date: 'asc' },
    })

    // Streak is always computed on the full history, not just the selected range
    const allDates = await db.entry.findMany({
      where: { userId: user.id },
      select: { date: true },
      orderBy: { date: 'desc' },
    })
    const dateSet = new Set(allDates.map((e) => e.date.toISOString().split('T')[0]))

    let streak = 0
    const cursor = new Date()
    cursor.setUTCHours(0, 0, 0, 0)
    // Today not filled in yet doesn't break the streak
    if (!dateSet.has(cursor.toISOString().split('T')[0])) {
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    }
    while (dateSet.has(cursor.toISOString().split('T')[0])) {
      streak++
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    }

    const formattedEntries = entries.map((entry) => ({
      date: entry.date.toISOString().split('T')[0],
      sleep: entry.sleep,
      energy: entry.energy,
      mood: entry.mood,
      movement: entry.movement,
      stimulation: entry.stimulation,
      positiveThing: entry.positiveThing,
    }))

    return NextResponse.json({
      entries: formattedEntries,
      streak,
      firstEntryDate: allDates.length > 0 ? allDates[allDates.length - 1].date.toISOString().split('T')[0] : null,
    })
  } catch (error) {
    console.error('[GET /api/dashboard] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: String(error) },
      { status: 500 }
    )
  }
}
