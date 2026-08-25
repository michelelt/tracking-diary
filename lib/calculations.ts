// Calculate hours slept from bed time and wake up time
export function calculateHoursSlept(bedTime: string, wakeUpTime: string): number {
  const [bedHour, bedMin] = bedTime.split(':').map(Number)
  const [wakeHour, wakeMin] = wakeUpTime.split(':').map(Number)

  let bedMinutes = bedHour * 60 + bedMin
  let wakeMinutes = wakeHour * 60 + wakeMin

  // If wake up time is before bed time, assume it's the next day
  if (wakeMinutes < bedMinutes) {
    wakeMinutes += 24 * 60
  }

  const hours = (wakeMinutes - bedMinutes) / 60
  return Math.round(hours * 4) / 4 // Round to nearest 0.25
}

// Calculate consecutive days of entries
export function calculateStreak(entries: Array<{ date: Date | string }>): number {
  if (!entries || entries.length === 0) return 0

  // Sort dates in descending order (newest first)
  const sorted = entries
    .map((e) => {
      const d = typeof e.date === 'string' ? new Date(e.date) : e.date
      return d
    })
    .sort((a, b) => b.getTime() - a.getTime())

  // Check if first entry is today or yesterday
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstEntryDate = new Date(sorted[0])
  firstEntryDate.setHours(0, 0, 0, 0)

  const dayDiff = Math.floor((today.getTime() - firstEntryDate.getTime()) / (1000 * 60 * 60 * 24))

  if (dayDiff > 1) return 0 // Streak broken

  let streak = 1
  let expectedDate = new Date(sorted[0])
  expectedDate.setHours(0, 0, 0, 0)

  for (let i = 1; i < sorted.length; i++) {
    expectedDate.setDate(expectedDate.getDate() - 1)

    const currentEntryDate = new Date(sorted[i])
    currentEntryDate.setHours(0, 0, 0, 0)

    if (currentEntryDate.getTime() === expectedDate.getTime()) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// Calculate average energy level for a period
export function calculateAverageEnergy(
  entries: Array<{ energy?: any }>,
  period: 'morning' | 'afternoon' | 'evening'
): number {
  const values = entries
    .filter((e) => e.energy && e.energy[period])
    .map((e) => e.energy[period])

  if (values.length === 0) return 0
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

// Calculate mood distribution
export function calculateMoodDistribution(
  entries: Array<{ mood?: string }>
): Record<string, number> {
  const moods = {
    basso: 0,
    neutro: 0,
    buono: 0,
    molto_buono: 0,
  }

  const filledEntries = entries.filter((e) => e.mood)

  filledEntries.forEach((e) => {
    if (e.mood && e.mood in moods) {
      moods[e.mood as keyof typeof moods]++
    }
  })

  return moods
}

// Calculate average sleep hours
export function calculateAverageSleep(entries: Array<{ sleep?: any }>): number {
  const hoursSlept = entries
    .filter((e) => e.sleep && e.sleep.hoursSlept)
    .map((e) => e.sleep.hoursSlept)

  if (hoursSlept.length === 0) return 0
  return Math.round((hoursSlept.reduce((a, b) => a + b, 0) / hoursSlept.length) * 10) / 10
}
