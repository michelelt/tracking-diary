'use client'

import { ChartCard } from '@/components/Dashboard/ChartCard'
import { EnergyBand, EnergyDayProfile, WeekdayRadar } from '@/components/Dashboard/EnergyCharts'
import { CorrelationMatrix, MovementDonut, StimulationMoodMatrix } from '@/components/Dashboard/HabitCharts'
import { MoodDonut, MoodHeatmap, MoodTrend } from '@/components/Dashboard/MoodCharts'
import { Night, SleepSchedule, SleepVsEnergy } from '@/components/Dashboard/SleepCharts'
import AnimatedNumber from '@/components/AnimatedNumber'
import Navigation from '@/components/Navigation'
import { MOODS } from '@/lib/constants'
import { localDateString } from '@/lib/dates'
import {
  COLORS,
  DashboardEntry,
  MOOD_ORDER,
  WEEKDAYS,
  avgEnergy,
  dayRange,
  isActive,
  mean,
  moodScore,
  pearson,
  rollingMean,
  round,
  sleepHours,
  stimulationScore,
  timeToMinutes,
  weekdayIndex,
} from '@/lib/dashboard'
import { CircleAlert } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'

interface DashboardResponse {
  entries: DashboardEntry[]
  streak: number
  firstEntryDate: string | null
}

const RANGES = [
  { id: '30', label: '30 giorni', days: 30 },
  { id: '90', label: '90 giorni', days: 90 },
  { id: '365', label: '1 anno', days: 365 },
  { id: 'all', label: 'Tutto', days: null },
] as const

type RangeId = (typeof RANGES)[number]['id']

function rangeStart(rangeId: RangeId): string | null {
  const range = RANGES.find((r) => r.id === rangeId)!
  if (range.days === null) return null
  const start = new Date()
  start.setDate(start.getDate() - (range.days - 1))
  return localDateString(start)
}

export default function DashboardPage() {
  const [rangeId, setRangeId] = useState<RangeId>('30')
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const from = rangeStart(rangeId)
        const res = await fetch(`/api/dashboard${from ? `?from=${from}` : ''}`)
        if (res.ok) {
          setData(await res.json())
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [rangeId])

  const view = useMemo(() => (data ? buildView(data, rangeId) : null), [data, rangeId])

  const topMood = view?.stats.topMood ? MOODS[view.stats.topMood as keyof typeof MOODS] : null

  return (
    <>
      <Navigation />
      <div className="page">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header + range filter */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="page-title">Progressi</h1>
            <div className="inline-flex gap-1 rounded-control bg-surface p-1">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRangeId(r.id)}
                  aria-pressed={rangeId === r.id}
                  className={`min-h-[44px] rounded-lg px-3 text-sm font-semibold transition duration-200 active:scale-[0.97] ${
                    rangeId === r.id ? 'bg-ink text-bg' : 'text-muted hover:text-ink'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {!view ? (
            loading ? (
              <div role="status" aria-label="Caricamento" className="space-y-8">
                <div className="skeleton h-40" />
                <div className="skeleton h-72 !rounded-card" />
                <div className="skeleton h-72 !rounded-card" />
              </div>
            ) : (
              <div className="card state" role="alert">
                <CircleAlert size={24} className="text-danger" aria-hidden="true" />
                <p className="font-semibold text-ink">Dati non caricati.</p>
                <p>Controlla la connessione e ricarica la pagina.</p>
              </div>
            )
          ) : (
            // Keep the previous render visible while a new range loads
            <div className={`space-y-8 transition-opacity duration-200 ${loading ? 'opacity-50' : ''}`}>
              {/* Hero: the streak leads, the rest follows */}
              <div className="grid items-end gap-8 lg:grid-cols-[auto_1fr] lg:gap-16">
                <div>
                  <p className="label">Serie attuale</p>
                  <p className="mt-2 flex items-baseline gap-3">
                    <span className="stat text-8xl md:text-9xl">
                      <AnimatedNumber value={data!.streak} />
                    </span>
                    <span className="text-lg font-bold text-muted">
                      {data!.streak === 1 ? 'giorno di fila' : 'giorni di fila'}
                    </span>
                    {data!.streak >= 3 && (
                      <span className="animate-pop text-4xl" role="img" aria-label="Serie in corso">
                        🔥
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
                  <StatTile
                    label="Giorni registrati"
                    number={view.entries.length}
                    detail={`su ${view.days.length} · ${view.days.length ? Math.round((view.entries.length / view.days.length) * 100) : 0}%`}
                  />
                  <StatTile
                    label="Energia media"
                    number={view.stats.energy}
                    decimals={1}
                    detail="su 10"
                    spark={view.sparks.energy}
                  />
                  <StatTile
                    label="Sonno medio"
                    number={view.stats.sleep}
                    decimals={1}
                    unit="h"
                    detail="a notte"
                    spark={view.sparks.sleep}
                  />
                  <StatTile
                    label="Umore prevalente"
                    text={topMood ? topMood.label : '–'}
                    detail={topMood ? 'il più frequente' : 'nessun dato'}
                    spark={view.sparks.mood}
                  />
                </div>
              </div>

              {view.entries.length === 0 ? (
                <div className="card state">
                  <p className="section-title">Qui non c&apos;è ancora niente.</p>
                  <p>Registra il primo giorno: bastano due minuti.</p>
                  <Link href="/today" className="btn-primary mt-4">
                    Registra oggi
                  </Link>
                </div>
              ) : (
                <>
                  <ChartCard title="Mappa dell'umore" subtitle="Un quadratino, un giorno.">
                    <MoodHeatmap days={view.days} byDate={view.byDate} />
                  </ChartCard>

                  <ChartCard title="Andamento dell'umore" subtitle="Punti: i singoli giorni. Linea: media a 7 giorni.">
                    <MoodTrend data={view.moodTrend} />
                  </ChartCard>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <ChartCard
                      title="Energia giorno per giorno"
                      subtitle="Linea: media del giorno. Fascia: dal minimo al massimo."
                      className="lg:col-span-2"
                    >
                      <EnergyBand data={view.energyTrend} />
                    </ChartCard>
                    <ChartCard title="La tua curva di energia" subtitle="Da mattina a sera.">
                      <EnergyDayProfile rows={view.profile.rows} dates={view.profile.dates} />
                    </ChartCard>
                  </div>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <ChartCard
                      title="Orari del sonno"
                      subtitle="Da quando vai a letto a quando ti svegli."
                      className="lg:col-span-2"
                    >
                      <SleepSchedule nights={view.nights} />
                    </ChartCard>
                    <ChartCard title="Sonno ed energia" subtitle={view.sleepEnergySubtitle}>
                      <SleepVsEnergy points={view.sleepEnergy} />
                    </ChartCard>
                  </div>

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <ChartCard title="Umore">
                      <MoodDonut counts={view.moodCounts} />
                    </ChartCard>
                    <ChartCard title="Movimento">
                      <MovementDonut
                        counts={view.movementCounts}
                        activeDays={view.activeDays}
                        trackedDays={view.movementDays}
                      />
                    </ChartCard>
                    <ChartCard title="Ritmo settimanale" subtitle="Energia e umore per giorno della settimana." className="md:col-span-2 lg:col-span-1">
                      <WeekdayRadar data={view.weekdays} />
                    </ChartCard>
                  </div>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <ChartCard title="Stimolazione e umore" subtitle="Giorni per ogni combinazione.">
                      <StimulationMoodMatrix counts={view.stimMood} />
                    </ChartCard>
                    <ChartCard title="Cosa va insieme" subtitle="Da -1 (opposte) a +1 (salgono insieme).">
                      <CorrelationMatrix labels={view.correlationLabels} correlations={view.correlations} />
                    </ChartCard>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// One number under a hairline; `text` replaces the number for non-numeric stats
function StatTile({
  label,
  number,
  decimals = 0,
  unit,
  text,
  detail,
  spark,
}: {
  label: string
  number?: number | null
  decimals?: number
  unit?: string
  text?: string
  detail: string
  spark?: (number | null)[]
}) {
  const sparkData = spark?.map((v, i) => ({ i, v }))
  const hasSpark = !!spark && spark.filter((v) => v !== null).length >= 2

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <div className="label">{label}</div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className={`stat ${text ? 'text-2xl' : 'text-4xl'}`}>
            {text ?? (typeof number === 'number' ? <AnimatedNumber value={number} decimals={decimals} /> : '–')}
            {unit && typeof number === 'number' && <span className="text-lg font-bold text-faint">{unit}</span>}
          </div>
          <div className="mt-2 text-xs text-muted">{detail}</div>
        </div>
        {hasSpark && (
          <div className="h-10 w-16 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Line
                  dataKey="v"
                  stroke={COLORS.series1}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

function buildView(data: DashboardResponse, rangeId: RangeId) {
  const entries = data.entries
  const byDate = new Map(entries.map((e) => [e.date, e]))
  const today = localDateString()
  const start = rangeStart(rangeId) ?? data.firstEntryDate ?? today
  const days = dayRange(start, today)

  // Per-day series over the whole range, with gaps for missing days
  const dailyEnergy = days.map((d) => (byDate.has(d) ? avgEnergy(byDate.get(d)!) : null))
  const dailySleep = days.map((d) => (byDate.has(d) ? sleepHours(byDate.get(d)!) : null))
  const dailyMood = days.map((d) => moodScore(byDate.get(d)?.mood))
  const moodAvg = rollingMean(dailyMood, 7)

  const moodTrend = days.map((date, i) => ({
    date,
    mood: dailyMood[i],
    moodKey: byDate.get(date)?.mood ?? null,
    avg: round(moodAvg[i], 2),
  }))

  const energyTrend = days.map((date, i) => {
    const e = byDate.get(date)?.energy
    const values = e ? [e.morning, e.afternoon, e.evening].filter((v): v is number => typeof v === 'number') : []
    return {
      date,
      avg: round(dailyEnergy[i], 1),
      range: values.length > 0 ? ([Math.min(...values), Math.max(...values)] as [number, number]) : null,
    }
  })

  // Energy through the day
  const slots = [
    { key: 'morning', label: 'Mattina' },
    { key: 'afternoon', label: 'Pomeriggio' },
    { key: 'evening', label: 'Sera' },
  ] as const
  const profileEntries = entries
    .filter((e) => e.energy && slots.filter((s) => typeof e.energy?.[s.key] === 'number').length >= 2)
    .slice(-30)
  const profileRows = slots.map((s) => {
    const row: { slot: string; avg: number | null; [date: string]: number | string | null } = {
      slot: s.label,
      avg: round(mean(entries.map((e) => e.energy?.[s.key])), 1),
    }
    profileEntries.forEach((e) => {
      row[e.date] = e.energy?.[s.key] ?? null
    })
    return row
  })

  // Sleep schedule: times before 15:00 belong to the next day
  const shift = (m: number) => (m < 15 * 60 ? m + 1440 : m)
  const nights: Night[] = entries.flatMap((e) => {
    const bed = timeToMinutes(e.sleep?.bedTime)
    const wake = timeToMinutes(e.sleep?.wakeUpTime)
    if (bed === null || wake === null) return []
    const b = shift(bed)
    let w = shift(wake)
    if (w <= b) w += 1440
    return [{ date: e.date, bed: b, wake: w, hours: sleepHours(e) }]
  })

  const sleepEnergy = entries.flatMap((e) => {
    const hours = sleepHours(e)
    const energy = avgEnergy(e)
    return hours !== null && energy !== null ? [{ date: e.date, hours, energy, mood: e.mood ?? null }] : []
  })
  const sleepEnergyR = pearson(sleepEnergy.map((p) => [p.hours, p.energy]))
  const sleepEnergySubtitle =
    sleepEnergyR === null
      ? 'Ogni punto è un giorno'
      : Math.abs(sleepEnergyR) < 0.2
        ? 'Per ora non si vede un legame chiaro'
        : sleepEnergyR > 0
          ? `Più dormi, più energia hai (r = ${sleepEnergyR.toFixed(2)})`
          : `Più dormi, meno energia hai (r = ${sleepEnergyR.toFixed(2)})`

  // Counts
  const moodCounts: Record<string, number> = {}
  const movementCounts: Record<string, number> = {}
  const stimMood: Record<string, Record<string, number>> = {}
  let activeDays = 0
  let movementDays = 0
  entries.forEach((e) => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
    e.movement?.types?.forEach((t) => {
      movementCounts[t] = (movementCounts[t] || 0) + 1
    })
    const active = isActive(e)
    if (active !== null) {
      movementDays++
      if (active) activeDays++
    }
    if (e.stimulation && e.mood) {
      stimMood[e.stimulation] = stimMood[e.stimulation] || {}
      stimMood[e.stimulation][e.mood] = (stimMood[e.stimulation][e.mood] || 0) + 1
    }
  })

  // Weekday rhythm, mood rescaled from 1-4 to 1-10
  const weekdays = WEEKDAYS.map((day, i) => {
    const dayEntries = entries.filter((e) => weekdayIndex(e.date) === i)
    const mood = mean(dayEntries.map((e) => moodScore(e.mood)))
    return {
      day,
      energy: round(mean(dayEntries.map(avgEnergy)), 1),
      mood: mood === null ? null : round(1 + ((mood - 1) / 3) * 9, 1),
      count: dayEntries.length,
    }
  })

  // Correlations between metrics, on the days where both are present
  const metrics: { label: string; value: (e: DashboardEntry) => number | null }[] = [
    { label: 'Sonno', value: sleepHours },
    { label: 'Energia', value: avgEnergy },
    { label: 'Umore', value: (e) => moodScore(e.mood) },
    { label: 'Stimolazione', value: (e) => stimulationScore(e.stimulation) },
    {
      label: 'Movimento',
      value: (e) => {
        const a = isActive(e)
        return a === null ? null : a ? 1 : 0
      },
    },
  ]
  const correlations = metrics.flatMap((ma, i) =>
    metrics.slice(i + 1).map((mb) => {
      const pairs = entries.flatMap((e) => {
        const a = ma.value(e)
        const b = mb.value(e)
        return a !== null && b !== null ? [[a, b] as [number, number]] : []
      })
      return { a: ma.label, b: mb.label, r: pearson(pairs), n: pairs.length }
    })
  )

  const topMood = MOOD_ORDER.filter((m) => moodCounts[m]).sort((a, b) => moodCounts[b] - moodCounts[a])[0] ?? null

  return {
    entries,
    byDate,
    days,
    stats: {
      energy: mean(entries.map(avgEnergy)),
      sleep: mean(entries.map(sleepHours)),
      topMood,
    },
    sparks: {
      energy: rollingMean(dailyEnergy, 7),
      sleep: rollingMean(dailySleep, 7),
      mood: moodAvg,
    },
    moodTrend,
    energyTrend,
    profile: { rows: profileRows, dates: profileEntries.map((e) => e.date) },
    nights,
    sleepEnergy,
    sleepEnergySubtitle,
    moodCounts,
    movementCounts,
    activeDays,
    movementDays,
    weekdays,
    stimMood,
    correlationLabels: metrics.map((m) => m.label),
    correlations,
  }
}
