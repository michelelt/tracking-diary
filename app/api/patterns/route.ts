import { auth } from '@/app/api/auth/[...nextauth]/route'
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

    const entries = await db.entry.findMany({
      where: { userId: user.id },
      orderBy: { date: 'asc' },
    })

    if (entries.length === 0) {
      return NextResponse.json({
        moodDistribution: {},
        movementFrequency: {},
        averageEnergy: 0,
        averageSleep: 0,
        totalEntries: 0,
        dateRange: {
          start: 'N/A',
          end: 'N/A',
        },
      })
    }

    // Calculate statistics
    const moodDistribution: Record<string, number> = {}
    const movementFrequency: Record<string, number> = {}
    let totalEnergy = 0
    let energyCount = 0
    let totalSleep = 0
    let sleepCount = 0

    entries.forEach((entry) => {
      // Mood distribution
      if (entry.mood) {
        moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1
      }

      // Movement frequency
      if (entry.movement && typeof entry.movement === 'object') {
        const movement = entry.movement as { types?: string[] }
        if (movement.types && Array.isArray(movement.types)) {
          movement.types.forEach((type) => {
            movementFrequency[type] = (movementFrequency[type] || 0) + 1
          })
        }
      }

      // Energy average
      if (entry.energy && typeof entry.energy === 'object') {
        const energy = entry.energy as Record<string, number>
        Object.values(energy).forEach((e) => {
          if (typeof e === 'number') {
            totalEnergy += e
            energyCount++
          }
        })
      }

      // Sleep average
      if (entry.sleep && typeof entry.sleep === 'object') {
        const sleep = entry.sleep as { hoursSlept?: number }
        if (typeof sleep.hoursSlept === 'number') {
          totalSleep += sleep.hoursSlept
          sleepCount++
        }
      }
    })

    const averageEnergy = energyCount > 0 ? totalEnergy / energyCount : 0
    const averageSleep = sleepCount > 0 ? totalSleep / sleepCount : 0

    const firstEntry = entries[0]
    const lastEntry = entries[entries.length - 1]

    return NextResponse.json({
      moodDistribution,
      movementFrequency,
      averageEnergy,
      averageSleep,
      totalEntries: entries.length,
      dateRange: {
        start: firstEntry.date.toISOString().split('T')[0],
        end: lastEntry.date.toISOString().split('T')[0],
      },
    })
  } catch (error) {
    console.error('[GET /api/patterns] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patterns', details: String(error) },
      { status: 500 }
    )
  }
}
