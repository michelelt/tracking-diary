import { calculateHoursSlept } from './calculations'
import { addDays, fromDateString } from './dates'
import { db } from './db'
import { DEMO_EMAIL, DEMO_HISTORY_DAYS, DEMO_SEED_ID_PREFIX } from './demo'
import type { Energy, Entry, Movement, Sleep } from './validators'

// Relative imports only: scripts/seed-demo.ts runs this file with ts-node, which doesn't know the @/ alias

export interface DemoEntry {
  date: string // YYYY-MM-DD
  sleep?: Sleep
  energy?: Energy
  mood?: NonNullable<Entry['mood']>
  movement?: Movement
  stimulation?: NonNullable<Entry['stimulation']>
  positiveThing?: string
}

const SLEEP_FEELINGS = ['male', 'così_così', 'bene', 'benissimo'] as const
const MOODS = ['basso', 'neutro', 'buono', 'molto_buono'] as const
const STIMULATIONS = ['poco', 'normale', 'tanto', 'troppo'] as const

const MOVEMENT_NOTES = {
  palestra: ['45 min di pesi', 'Gambe e core', 'Scheda completa, 1 ora'],
  nuoto: ['30 vasche', '40 min a stile libero'],
  altro: ['Camminata di 40 min', 'Giro in bici', 'Yoga a casa, 20 min', 'Passeggiata dopo cena'],
}

const POSITIVE_THINGS = [
  'Caffè al sole prima di iniziare.',
  'Ho finito il libro che leggevo da mesi.',
  'Telefonata lunga con mia sorella.',
  'Pranzo fuori con i colleghi.',
  'Ho cucinato un risotto venuto bene.',
  'Tramonto bellissimo tornando a casa.',
  'Finalmente ho sistemato la scrivania.',
  'Allenamento andato meglio del previsto.',
  'Una passeggiata al parco dopo pranzo.',
  'Ho rivisto un vecchio amico.',
  'Serata tranquilla con un bel film.',
  'Complimenti inaspettati al lavoro.',
  'Ho dormito senza svegliarmi mai.',
  'Gelato in centro, il primo della stagione.',
  'Ho chiuso un progetto che mi pesava.',
  'Cena in famiglia, tante risate.',
  'Mattina senza fretta, colazione lunga.',
  'Ho imparato una ricetta nuova.',
  'Il treno era puntuale, per una volta.',
  'Mezz’ora di musica senza telefono.',
  'Ho aiutato un collega e mi ha ringraziato.',
  'Giro al mercato, frutta buonissima.',
  'Pioggia fuori, divano e tè caldo.',
  'Ho ritrovato una foto che cercavo.',
  'Nuotata lenta, testa leggera dopo.',
  'Una bella chiacchierata con il vicino.',
  'Ho detto di no senza sentirmi in colpa.',
  'Pizza fatta in casa con gli amici.',
  'Camminata in collina, aria pulita.',
  'Riunione corta e utile, rara.',
  'Ho piantato il basilico sul balcone.',
  'Messaggio affettuoso di un’amica lontana.',
  'Ho preso la bici invece dell’auto.',
  'Pomeriggio libero, nessun impegno.',
  'Il gatto mi ha dormito addosso.',
  'Ho riso fino alle lacrime a cena.',
  'Un podcast che mi ha fatto pensare.',
  'Casa in ordine, mente più leggera.',
  'Ho prenotato le vacanze.',
  'Aperitivo improvvisato dopo il lavoro.',
  'Sveglia presto e alba dalla finestra.',
  'Ho suonato la chitarra dopo tanto.',
  'Un problema difficile risolto al primo colpo.',
  'Pane fresco ancora caldo dal forno.',
  'Ho ricevuto una cartolina vera.',
  'Doccia calda dopo la palestra.',
  'Domenica lenta, giornale e caffè.',
  'Ho fatto pace con una persona cara.',
  'Stelle limpide rientrando tardi.',
  'Una pagina di diario scritta di getto.',
]

// Small seeded PRNG: a given date always produces the same entry
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

// Minutes from midnight (rounded to 5, wrapping past 24h) -> HH:MM
function toTime(minutes: number): string {
  const m = (((Math.round(minutes / 5) * 5) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

const dayNumber = (date: string) => fromDateString(date).getTime() / 86400000

// One plausible day. Sleep drives energy, energy and movement drive mood
function demoEntry(date: string): DemoEntry {
  const day = dayNumber(date)
  const rng = mulberry32(day)
  const noise = (spread: number) => (rng() - 0.5) * 2 * spread
  const pick = <T>(list: readonly T[]) => list[Math.floor(rng() * list.length)]
  const weekday = fromDateString(date).getUTCDay()
  const weekend = weekday === 0 || weekday === 6
  // Slow wave (about 6 weeks) so the charts show good and bad stretches, not just noise
  const wave = Math.sin(day / 7)

  // The night before: longer at the weekend, now and then a short one
  const badNight = rng() < 0.15
  const bed = 23 * 60 + 10 + (weekend ? 40 : 0) + (badNight ? 80 : 0) - wave * 20 + noise(35)
  const wake = (weekend ? 8 * 60 + 30 : 7 * 60) - (badNight ? 30 : 0) + wave * 15 + noise(25)
  const bedTime = toTime(bed)
  const wakeUpTime = toTime(wake)
  // Same rounding as the entry form
  const hoursSlept = calculateHoursSlept(bedTime, wakeUpTime)
  const feltHours = hoursSlept + noise(0.5)
  const feeling = SLEEP_FEELINGS[feltHours < 6 ? 0 : feltHours < 7 ? 1 : feltHours < 8.5 ? 2 : 3]
  const sleep: Sleep = { bedTime, wakeUpTime, feeling, hoursSlept }
  if (rng() < 0.7) sleep.fallAsleepTime = toTime(bed + 10 + rng() * 30)

  const active = rng() < 0.55 + wave * 0.15
  const base = 6 + (hoursSlept - 7.5) * 1.3 + wave * 0.8 + noise(0.8)
  const level = (value: number) => clamp(Math.round(value), 1, 10)
  const energy: Energy = {
    morning: level(base),
    afternoon: level(base + (active ? 0.5 : -0.5) + noise(1)),
    evening: level(base - 1 + (active ? 0.5 : 0) + noise(1)),
  }
  const avgEnergy = (energy.morning! + energy.afternoon! + energy.evening!) / 3
  // The evening is the one that gets skipped most often
  if (rng() < 0.15) delete energy.evening

  const type = ([1, 3, 5].includes(weekday) ? 'palestra' : [2, 6].includes(weekday) ? 'nuoto' : 'altro') as
    | 'palestra'
    | 'nuoto'
    | 'altro'
  const movement: Movement = { types: active ? [type] : ['niente'] }
  if (active && rng() < 0.6) movement.notes = pick(MOVEMENT_NOTES[type])

  // Busier on working days
  const stimulationLevel = clamp(Math.floor((weekend ? 0.3 : 1.1) + rng() * (weekend ? 2 : 2.3)), 0, 3)

  const moodLevel = clamp(
    Math.round((avgEnergy - 3.8) / 1.6 + (active ? 0.3 : 0) - (stimulationLevel === 3 ? 0.6 : 0) + noise(0.4)),
    0,
    3
  )

  // Not every day is filled in completely
  const entry: DemoEntry = { date }
  if (rng() < 0.92) entry.sleep = sleep
  if (rng() < 0.92) entry.energy = energy
  if (rng() < 0.95) entry.mood = MOODS[moodLevel]
  if (rng() < 0.88) entry.movement = movement
  if (rng() < 0.85) entry.stimulation = STIMULATIONS[stimulationLevel]
  if (rng() < 0.65) entry.positiveThing = POSITIVE_THINGS[day % POSITIVE_THINGS.length]
  return entry
}

// About 3 months of history ending yesterday. Today stays empty, and so do a few scattered
// days: a real diary has gaps, and the visitor needs free days to fill in
export function buildDemoEntries(today: string): DemoEntry[] {
  const entries: DemoEntry[] = []
  const usedTexts = new Set<string>()

  for (let back = DEMO_HISTORY_DAYS; back >= 1; back--) {
    const date = addDays(today, -back)
    // Yesterday is always there, so the demo never looks abandoned
    if (back > 1 && mulberry32(-dayNumber(date))() < 0.12) continue

    const entry = demoEntry(date)
    // No positive thing twice in the same history
    if (entry.positiveThing && usedTexts.has(entry.positiveThing)) delete entry.positiveThing
    if (entry.positiveThing) usedTexts.add(entry.positiveThing)
    entries.push(entry)
  }

  return entries
}

const romeToday = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })

// Wipes the demo user's entries and rebuilds the history up to yesterday. Idempotent:
// shared by scripts/seed-demo.ts and the nightly cron (app/api/cron/reset-demo)
export async function resetDemo(today: string = romeToday()): Promise<number> {
  const user = await db.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: 'Demo' },
  })
  const entries = buildDemoEntries(today)

  await db.$transaction([
    db.entry.deleteMany({ where: { userId: user.id } }),
    db.entry.createMany({
      data: entries.map(({ date, ...fields }) => ({
        ...fields,
        // The id prefix is what marks an entry as history: see isSeedEntry in lib/demo.ts
        id: DEMO_SEED_ID_PREFIX + date,
        userId: user.id,
        date: fromDateString(date),
        createdAt: fromDateString(date),
      })),
    }),
  ])

  return entries.length
}
