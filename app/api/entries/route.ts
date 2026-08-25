import { auth } from '@/auth'
import { db } from '@/lib/db'
import { EntrySchema } from '@/lib/validators'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    console.log('[GET /api/entries] Session:', { email: session?.user?.email })

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })
    console.log('[GET /api/entries] User found:', { userId: user?.id })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    console.log('[GET /api/entries] Date:', date)

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const entry = await db.entry.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: new Date(date + 'T00:00:00Z'), // Convert YYYY-MM-DD to ISO DateTime
        },
      },
    })
    console.log('[GET /api/entries] Entry found:', { entryId: entry?.id })

    // Format date back to YYYY-MM-DD string
    const formattedEntry = entry ? {
      ...entry,
      date: entry.date.toISOString().split('T')[0],
    } : null

    return NextResponse.json({ entry: formattedEntry })
  } catch (error) {
    console.error('[GET /api/entries] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch entry', details: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

  try {
    const body = await req.json()
    console.log('[POST /api/entries] Body received:', JSON.stringify(body))

    // Validate input
    const validated = EntrySchema.parse(body)
    console.log('[POST /api/entries] Validated:', validated)

    const dateObj = new Date(validated.date + 'T00:00:00Z')
    const entry = await db.entry.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: dateObj, // Convert YYYY-MM-DD to ISO DateTime
        },
      },
      update: {
        sleep: validated.sleep || undefined,
        energy: validated.energy || undefined,
        mood: validated.mood || undefined,
        movement: validated.movement || undefined,
        stimulation: validated.stimulation || undefined,
        positiveThing: validated.positiveThing || undefined,
      },
      create: {
        userId: user.id,
        date: dateObj,
        sleep: validated.sleep || undefined,
        energy: validated.energy || undefined,
        mood: validated.mood || undefined,
        movement: validated.movement || undefined,
        stimulation: validated.stimulation || undefined,
        positiveThing: validated.positiveThing || undefined,
      },
    })

    // Format date back to YYYY-MM-DD string
    const formattedEntry = {
      ...entry,
      date: entry.date.toISOString().split('T')[0],
    }

    return NextResponse.json({ entry: formattedEntry }, { status: 200 })
  } catch (error) {
    console.error('Entry save error:', error)
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
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

  try {
    const body = await req.json()
    const { date } = body

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const dateObj = new Date(date + 'T00:00:00Z')

    await db.entry.delete({
      where: {
        userId_date: {
          userId: user.id,
          date: dateObj,
        },
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Entry delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete entry', details: String(error) },
      { status: 500 }
    )
  }
}
