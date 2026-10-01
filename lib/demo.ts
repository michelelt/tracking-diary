import { addDays, toDateString } from './dates'

// Demo mode: one shared account, open to anyone from the login page

export const DEMO_EMAIL = 'demo@demo.it'
export const DEMO_DISCLAIMER = 'Demo: ciò che aggiungi viene cancellato a mezzanotte.'
export const DEMO_HISTORY_DAYS = 90
export const DEMO_NEW_ENTRIES_LIMIT = 2

// Seeded entries carry this id prefix; a visitor's entry gets a cuid from Prisma
export const DEMO_SEED_ID_PREFIX = 'demo-seed-'

export const DEMO_READONLY_ERROR = 'Demo: lo storico è in sola lettura.'
export const DEMO_LIMIT_ERROR = `Demo: limite di ${DEMO_NEW_ENTRIES_LIMIT} nuove giornate raggiunto.`
export const DEMO_RANGE_ERROR = 'Demo: scegli un giorno degli ultimi 3 mesi.'

export const isDemoEmail = (email?: string | null) => email === DEMO_EMAIL

export const isSeedEntry = (entry: { id: string }) => entry.id.startsWith(DEMO_SEED_ID_PREFIX)

// Why the demo user can't save this day, or null if they can.
// existing: the entry already on that date; newCount: visitor entries currently stored
export function demoWriteError(
  existing: { id: string } | null,
  newCount: number,
  date: string,
  today: string = toDateString(new Date())
): string | null {
  if (existing) return isSeedEntry(existing) ? DEMO_READONLY_ERROR : null
  if (newCount >= DEMO_NEW_ENTRIES_LIMIT) return DEMO_LIMIT_ERROR
  // A stray date would stretch the "all history" charts for every visitor. +1: the browser can be a day ahead of UTC
  if (date < addDays(today, -DEMO_HISTORY_DAYS) || date > addDays(today, 1)) return DEMO_RANGE_ERROR
  return null
}
