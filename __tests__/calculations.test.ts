import { calculateHoursSlept } from '@/lib/calculations'

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
