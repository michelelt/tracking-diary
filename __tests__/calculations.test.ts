import {
  calculateAverageEnergy,
  calculateAverageSleep,
  calculateHoursSlept,
  calculateMoodDistribution,
  calculateStreak,
} from '@/lib/calculations'

describe('calculateHoursSlept', () => {
  it('should calculate hours slept correctly', () => {
    expect(calculateHoursSlept('23:00', '07:00')).toBe(8)
    expect(calculateHoursSlept('23:30', '07:30')).toBe(8)
    expect(calculateHoursSlept('22:00', '06:30')).toBe(8.5)
  })

  it('should handle edge cases', () => {
    expect(calculateHoursSlept('23:00', '23:00')).toBe(0)
    expect(calculateHoursSlept('23:45', '07:15')).toBe(7.5)
  })
})

describe('calculateStreak', () => {
  it('should return 0 for empty entries', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('should return 1 for entry today', () => {
    const today = new Date()
    expect(calculateStreak([{ date: today }])).toBe(1)
  })

  it('should return streak length for consecutive days', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const entries = [
      { date: today },
      { date: yesterday },
      { date: twoDaysAgo },
    ]

    expect(calculateStreak(entries)).toBe(3)
  })

  it('should break streak if day is missing', () => {
    const today = new Date()
    const threeDaysAgo = new Date(today)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const entries = [
      { date: today },
      { date: threeDaysAgo },
    ]

    expect(calculateStreak(entries)).toBe(1)
  })
})

describe('calculateAverageEnergy', () => {
  it('should return 0 for empty entries', () => {
    expect(calculateAverageEnergy([], 'morning')).toBe(0)
  })

  it('should calculate average correctly', () => {
    const entries = [
      { energy: { morning: 5 } },
      { energy: { morning: 7 } },
      { energy: { morning: 8 } },
    ]
    expect(calculateAverageEnergy(entries, 'morning')).toBe(6.7)
  })

  it('should ignore entries without energy data', () => {
    const entries = [
      { energy: { morning: 5 } },
      { energy: {} },
      { energy: { morning: 9 } },
    ]
    expect(calculateAverageEnergy(entries, 'morning')).toBe(7)
  })
})

describe('calculateMoodDistribution', () => {
  it('should return zero counts for empty entries', () => {
    const result = calculateMoodDistribution([])
    expect(result.basso).toBe(0)
    expect(result.neutro).toBe(0)
  })

  it('should count moods correctly', () => {
    const entries = [
      { mood: 'basso' },
      { mood: 'basso' },
      { mood: 'buono' },
      { mood: 'molto_buono' },
    ]
    const result = calculateMoodDistribution(entries)
    expect(result.basso).toBe(2)
    expect(result.buono).toBe(1)
    expect(result.molto_buono).toBe(1)
    expect(result.neutro).toBe(0)
  })
})

describe('calculateAverageSleep', () => {
  it('should return 0 for empty entries', () => {
    expect(calculateAverageSleep([])).toBe(0)
  })

  it('should calculate average sleep hours', () => {
    const entries = [
      { sleep: { hoursSlept: 7 } },
      { sleep: { hoursSlept: 8 } },
      { sleep: { hoursSlept: 6 } },
    ]
    expect(calculateAverageSleep(entries)).toBe(7)
  })
})
