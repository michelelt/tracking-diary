import { requireAuthUser } from '@/lib/api-helpers'
import { fromDateString, toDateString } from '@/lib/dates'
import { db } from '@/lib/db'
import { DEMO_READONLY_ERROR, DEMO_SEED_ID_PREFIX, demoWriteError, isDemoEmail, isSeedEntry } from '@/lib/demo'
import { DateSchema, EntrySchema } from '@/lib/validators'
import { NextRequest, NextResponse } from 'next/server'

// demo: true tells the pages that the error is a message for the visitor
const demoForbidden = (error: string) => NextResponse.json({ error, demo: true }, { status: 403 })

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthUser()
  if (error) return error

  const date = DateSchema.safeParse(new URL(req.url).searchParams.get('date'))
  if (!date.success) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  const entry = await db.entry.findUnique({
    where: { userId_date: { userId: user.id, date: fromDateString(date.data) } },
  })

  return NextResponse.json({ entry: entry && { ...entry, date: toDateString(entry.date) } })
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthUser()
  if (error) return error

  const parsed = EntrySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid entry' }, { status: 400 })
  }

  const validated = parsed.data
  const date = fromDateString(validated.date)

  // Demo account: the seeded history is read-only and new entries are capped
  if (isDemoEmail(user.email)) {
    // ponytail: count then create isn't atomic, two simultaneous visitors can overshoot the cap by one until the nightly reset
    const [existing, newCount] = await Promise.all([
      db.entry.findUnique({ where: { userId_date: { userId: user.id, date } } }),
      db.entry.count({ where: { userId: user.id, NOT: { id: { startsWith: DEMO_SEED_ID_PREFIX } } } }),
    ])
    const demoError = demoWriteError(existing, newCount, validated.date)
    if (demoError) return demoForbidden(demoError)
  }

  // Missing or null fields are left untouched
  const data = {
    sleep: validated.sleep ?? undefined,
    energy: validated.energy ?? undefined,
    mood: validated.mood ?? undefined,
    movement: validated.movement ?? undefined,
    stimulation: validated.stimulation ?? undefined,
    positiveThing: validated.positiveThing ?? undefined,
  }

  const entry = await db.entry.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: data,
    create: { userId: user.id, date, ...data },
  })

  return NextResponse.json({ entry: { ...entry, date: toDateString(entry.date) } })
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuthUser()
  if (error) return error

  const date = DateSchema.safeParse((await req.json()).date)
  if (!date.success) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  // Demo account: only the visitors' own entries can be deleted
  if (isDemoEmail(user.email)) {
    const existing = await db.entry.findUnique({
      where: { userId_date: { userId: user.id, date: fromDateString(date.data) } },
    })
    if (existing && isSeedEntry(existing)) return demoForbidden(DEMO_READONLY_ERROR)
  }

  await db.entry.deleteMany({
    where: { userId: user.id, date: fromDateString(date.data) },
  })

  return NextResponse.json({ success: true })
}
