import { requireAuthUser } from '@/lib/api-helpers'
import { fromDateString, toDateString } from '@/lib/dates'
import { db } from '@/lib/db'
import { DateSchema } from '@/lib/validators'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthUser()
  if (error) return error

  // ?from=YYYY-MM-DD limits the entries; omitted means all history
  const from = DateSchema.safeParse(new URL(req.url).searchParams.get('from'))

  const entries = await db.entry.findMany({
    where: {
      userId: user.id,
      ...(from.success ? { date: { gte: fromDateString(from.data) } } : {}),
    },
    orderBy: { date: 'asc' },
  })

  // Streak is always computed on the full history, not just the selected range
  const allDates = await db.entry.findMany({
    where: { userId: user.id },
    select: { date: true },
    orderBy: { date: 'asc' },
  })
  const dateSet = new Set(allDates.map((e) => toDateString(e.date)))

  let streak = 0
  const cursor = new Date()
  cursor.setUTCHours(0, 0, 0, 0)
  // Today not filled in yet doesn't break the streak
  if (!dateSet.has(toDateString(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  while (dateSet.has(toDateString(cursor))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  return NextResponse.json({
    entries: entries.map((entry) => ({
      date: toDateString(entry.date),
      sleep: entry.sleep,
      energy: entry.energy,
      mood: entry.mood,
      movement: entry.movement,
      stimulation: entry.stimulation,
      positiveThing: entry.positiveThing,
    })),
    streak,
    firstEntryDate: allDates.length > 0 ? toDateString(allDates[0].date) : null,
  })
}
