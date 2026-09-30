import { calculateHoursSlept } from '@/lib/calculations'

export interface DashboardEntry {
  date: string // YYYY-MM-DD
  sleep?: {
    bedTime?: string
    fallAsleepTime?: string
    wakeUpTime?: string
    feeling?: string
    hoursSlept?: number
  } | null
  energy?: { morning?: number; afternoon?: number; evening?: number } | null
  mood?: string | null
  movement?: { types?: string[]; notes?: string } | null
  stimulation?: string | null
  positiveThing?: string | null
}

// Chart palette (validated: categorical slots 1-3 all-pairs, mood diverging red <-> gray <-> blue)
export const COLORS = {
  series1: '#2a78d6',
  series2: '#eb6834',
  series3: '#1baf7a',
  none: '#a8a69e',
  grid: '#e2e8f0',
  axis: '#94a3b8',
  empty: '#f1f5f9',
}

export const MOOD_ORDER = ['basso', 'neutro', 'buono', 'molto_buono'] as const
export const MOOD_COLORS: Record<string, string> = {
  basso: '#e34948',
  neutro: '#c9c7bf',
  buono: '#5598e7',
  molto_buono: '#184f95',
}

export const STIMULATION_ORDER = ['poco', 'normale', 'tanto', 'troppo'] as const

export const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export function moodScore(mood?: string | null): number | null {
  const i = MOOD_ORDER.indexOf(mood as (typeof MOOD_ORDER)[number])
  return i === -1 ? null : i + 1
}

export function stimulationScore(stimulation?: string | null): number | null {
  const i = STIMULATION_ORDER.indexOf(stimulation as (typeof STIMULATION_ORDER)[number])
  return i === -1 ? null : i + 1
}

export function energyValues(entry: DashboardEntry): number[] {
  const e = entry.energy
  if (!e) return []
  return [e.morning, e.afternoon, e.evening].filter((v): v is number => typeof v === 'number')
}

export function avgEnergy(entry: DashboardEntry): number | null {
  return mean(energyValues(entry))
}

export function sleepHours(entry: DashboardEntry): number | null {
  const s = entry.sleep
  if (!s) return null
  if (typeof s.hoursSlept === 'number') return s.hoursSlept
  if (s.bedTime && s.wakeUpTime) return calculateHoursSlept(s.bedTime, s.wakeUpTime)
  return null
}

export function isActive(entry: DashboardEntry): boolean | null {
  const types = entry.movement?.types
  if (!types || types.length === 0) return null
  return types.some((t) => t !== 'niente')
}

export function mean(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number')
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function round(value: number | null, digits = 1): number | null {
  if (value === null) return null
  const f = 10 ** digits
  return Math.round(value * f) / f
}

// Trailing moving average that skips missing days
export function rollingMean(values: (number | null)[], window: number): (number | null)[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1)
    const nums = slice.filter((v): v is number => v !== null)
    return nums.length >= Math.min(3, window) ? nums.reduce((a, b) => a + b, 0) / nums.length : null
  })
}

export function pearson(pairs: [number, number][]): number | null {
  const n = pairs.length
  if (n < 3) return null
  const mx = pairs.reduce((a, [x]) => a + x, 0) / n
  const my = pairs.reduce((a, [, y]) => a + y, 0) / n
  let num = 0
  let dx = 0
  let dy = 0
  for (const [x, y] of pairs) {
    num += (x - mx) * (y - my)
    dx += (x - mx) ** 2
    dy += (y - my) ** 2
  }
  if (dx === 0 || dy === 0) return null
  return num / Math.sqrt(dx * dy)
}

export function linearFit(pairs: [number, number][]): { slope: number; intercept: number } | null {
  const n = pairs.length
  if (n < 2) return null
  const mx = pairs.reduce((a, [x]) => a + x, 0) / n
  const my = pairs.reduce((a, [, y]) => a + y, 0) / n
  let num = 0
  let den = 0
  for (const [x, y] of pairs) {
    num += (x - mx) * (y - my)
    den += (x - mx) ** 2
  }
  if (den === 0) return null
  const slope = num / den
  return { slope, intercept: my - slope * mx }
}

export function timeToMinutes(time?: string): number | null {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

// All YYYY-MM-DD strings from start to end (inclusive), in UTC to match stored dates
export function dayRange(start: string, end: string): string[] {
  const days: string[] = []
  const cur = new Date(start + 'T00:00:00Z')
  const last = new Date(end + 'T00:00:00Z')
  while (cur <= last) {
    days.push(cur.toISOString().split('T')[0])
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return days
}

// Monday = 0 ... Sunday = 6
export function weekdayIndex(date: string): number {
  return (new Date(date + 'T00:00:00Z').getUTCDay() + 6) % 7
}

export function formatShortDate(date: string): string {
  return new Date(date + 'T00:00:00Z').toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

export function formatLongDate(date: string): string {
  return new Date(date + 'T00:00:00Z').toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}
