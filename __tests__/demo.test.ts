jest.mock('@/lib/db', () => ({ db: {} }))

import { addDays } from '@/lib/dates'
import {
  DEMO_HISTORY_DAYS,
  DEMO_LIMIT_ERROR,
  DEMO_RANGE_ERROR,
  DEMO_READONLY_ERROR,
  demoWriteError,
  isSeedEntry,
} from '@/lib/demo'
import { buildDemoEntries } from '@/lib/demo-seed'
import { EntrySchema } from '@/lib/validators'

const TODAY = '2026-10-01'
const seeded = { id: 'demo-seed-2026-09-20' }
const added = { id: 'cm1visitorentry0000' }

describe('demo write rules', () => {
  it('tells seeded history from visitor entries by id', () => {
    expect(isSeedEntry(seeded)).toBe(true)
    expect(isSeedEntry(added)).toBe(false)
  })

  it('keeps the seeded history read-only', () => {
    expect(demoWriteError(seeded, 0, '2026-09-20', TODAY)).toBe(DEMO_READONLY_ERROR)
  })

  it('allows new entries up to the limit', () => {
    expect(demoWriteError(null, 0, TODAY, TODAY)).toBeNull()
    expect(demoWriteError(null, 1, TODAY, TODAY)).toBeNull()
    expect(demoWriteError(null, 2, TODAY, TODAY)).toBe(DEMO_LIMIT_ERROR)
  })

  it('lets a visitor entry be edited even when the limit is reached', () => {
    expect(demoWriteError(added, 2, TODAY, TODAY)).toBeNull()
  })

  it('rejects new entries outside the demo window', () => {
    expect(demoWriteError(null, 0, '2010-01-01', TODAY)).toBe(DEMO_RANGE_ERROR)
    expect(demoWriteError(null, 0, '2026-10-03', TODAY)).toBe(DEMO_RANGE_ERROR)
    expect(demoWriteError(null, 0, addDays(TODAY, -DEMO_HISTORY_DAYS), TODAY)).toBeNull()
  })
})

describe('demo seed', () => {
  const entries = buildDemoEntries(TODAY)
  const dates = entries.map((e) => e.date)

  it('respects the entry validators', () => {
    entries.forEach((entry) => expect(() => EntrySchema.strict().parse(entry)).not.toThrow())
  })

  it('reaches yesterday and leaves today empty', () => {
    expect(dates[dates.length - 1]).toBe('2026-09-30')
    expect(dates).not.toContain(TODAY)
    expect(dates[0] >= addDays(TODAY, -DEMO_HISTORY_DAYS)).toBe(true)
  })

  it('leaves some scattered days empty', () => {
    expect(new Set(dates).size).toBe(dates.length)
    expect(dates.length).toBeGreaterThan(70)
    expect(dates.length).toBeLessThan(DEMO_HISTORY_DAYS - 3)
  })

  it('does not fill in every field of every entry', () => {
    expect(entries.some((e) => !e.sleep)).toBe(true)
    expect(entries.some((e) => !e.positiveThing)).toBe(true)
  })

  it('never repeats a positive thing', () => {
    const texts = entries.flatMap((e) => (e.positiveThing ? [e.positiveThing] : []))
    expect(texts.length).toBeGreaterThan(20)
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('ties low sleep to low energy', () => {
    const avg = (list: typeof entries) =>
      list.reduce((sum, e) => sum + e.energy!.morning!, 0) / list.length
    const withBoth = entries.filter((e) => e.sleep && e.energy)
    const short = withBoth.filter((e) => e.sleep!.hoursSlept! < 6.5)
    const long = withBoth.filter((e) => e.sleep!.hoursSlept! >= 8)
    expect(short.length).toBeGreaterThan(0)
    expect(avg(short)).toBeLessThan(avg(long))
  })

  it('is the same every time for a given day', () => {
    expect(buildDemoEntries(TODAY)).toEqual(entries)
  })
})
