import { auth } from '@/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
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

    // Get last 30 days of entries
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const entries = await db.entry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Calculate daily trends
    const dailyTrends = entries.map((entry) => ({
      date: entry.date.toISOString().split('T')[0],
      mood: entry.mood,
      energy: entry.energy && typeof entry.energy === 'object'
        ? Math.round(
            Object.values(entry.energy as Record<string, number>).reduce((a: number, b: number) => a + b, 0) /
              Object.keys(entry.energy as object).length
          )
        : undefined,
      sleep: entry.sleep && typeof entry.sleep === 'object'
        ? (entry.sleep as { hoursSlept?: number }).hoursSlept
        : undefined,
    }))

    // Calculate mood distribution
    const moodCounts: Record<string, number> = {}
    entries.forEach((entry) => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
      }
    })

    const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: count,
      emoji: '😊',
    }))

    // Calculate movement frequency
    const movementCounts: Record<string, number> = {}
    entries.forEach((entry) => {
      if (entry.movement && typeof entry.movement === 'object') {
        const movement = entry.movement as { types?: string[] }
        if (movement.types && Array.isArray(movement.types)) {
          movement.types.forEach((type) => {
            movementCounts[type] = (movementCounts[type] || 0) + 1
          })
        }
      }
    })

    const movementFrequency = Object.entries(movementCounts).map(([movement, count]) => ({
      name: movement.charAt(0).toUpperCase() + movement.slice(1),
      value: count,
      emoji: '🏃',
    }))

    // Calculate weekly stats
    const weeklyStats: Record<
      string,
      { entries: number; totalEnergy: number; energyCount: number; totalSleep: number; sleepCount: number }
    > = {}

    entries.forEach((entry) => {
      const weekStart = new Date(entry.date)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = {
          entries: 0,
          totalEnergy: 0,
          energyCount: 0,
          totalSleep: 0,
          sleepCount: 0,
        }
      }

      weeklyStats[weekKey].entries += 1

      if (entry.energy && typeof entry.energy === 'object') {
        Object.values(entry.energy as Record<string, number>).forEach((e) => {
          if (typeof e === 'number') {
            weeklyStats[weekKey].totalEnergy += e
            weeklyStats[weekKey].energyCount += 1
          }
        })
      }

      if (entry.sleep && typeof entry.sleep === 'object') {
        const sleepData = entry.sleep as { hoursSlept?: number }
        if (typeof sleepData.hoursSlept === 'number') {
          weeklyStats[weekKey].totalSleep += sleepData.hoursSlept
          weeklyStats[weekKey].sleepCount += 1
        }
      }
    })

    const weeklyStatsArray = Object.entries(weeklyStats)
      .map(([week, stats]) => ({
        week,
        entries: stats.entries,
        avgEnergy: stats.energyCount > 0 ? Math.round((stats.totalEnergy / stats.energyCount) * 10) / 10 : 0,
        avgSleep: stats.sleepCount > 0 ? Math.round((stats.totalSleep / stats.sleepCount) * 10) / 10 : 0,
      }))
      .slice(-8) // Last 8 weeks

    // Calculate stats
    let totalEnergy = 0
    let energyCount = 0
    let totalSleep = 0
    let sleepCount = 0

    entries.forEach((entry) => {
      if (entry.energy && typeof entry.energy === 'object') {
        Object.values(entry.energy as Record<string, number>).forEach((e) => {
          if (typeof e === 'number') {
            totalEnergy += e
            energyCount += 1
          }
        })
      }

      if (entry.sleep && typeof entry.sleep === 'object') {
        const sleepData = entry.sleep as { hoursSlept?: number }
        if (typeof sleepData.hoursSlept === 'number') {
          totalSleep += sleepData.hoursSlept
          sleepCount += 1
        }
      }
    })

    // Calculate streak
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]

      const hasEntry = entries.some((e) => e.date.toISOString().split('T')[0] === dateStr)
      if (hasEntry) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    // Get best mood
    const bestMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    return NextResponse.json({
      dailyTrends,
      moodDistribution,
      movementFrequency,
      weeklyStats: weeklyStatsArray,
      stats: {
        totalEntries: entries.length,
        currentStreak: streak,
        avgEnergy: energyCount > 0 ? totalEnergy / energyCount : 0,
        avgSleep: sleepCount > 0 ? totalSleep / sleepCount : 0,
        bestMood,
      },
    })
  } catch (error) {
    console.error('[GET /api/dashboard] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: String(error) },
      { status: 500 }
    )
  }
}
