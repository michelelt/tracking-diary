'use client'

import { MOODS, MOVEMENT_TYPES, STIMULATION_LEVELS } from '@/lib/constants'
import { COLORS, MOOD_ORDER, STIMULATION_ORDER } from '@/lib/dashboard'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { EmptyState, LegendItem, Swatch, TooltipBox } from './ChartCard'

const MOVEMENT_COLORS: Record<string, string> = {
  palestra: COLORS.series1,
  nuoto: COLORS.series2,
  altro: COLORS.series3,
  niente: COLORS.none,
}

// Blend from the empty-cell tone towards `color`
const mix = (color: string, t: number) => `color-mix(in srgb, ${color} ${Math.round(t * 100)}%, ${COLORS.empty})`

function MoodIcon({ mood }: { mood: keyof typeof MOODS }) {
  const Icon = MOODS[mood].icon
  return <Icon size={20} className="mx-auto mb-1" aria-hidden="true" />
}

// Part-to-whole of movement types, with active days in the center
export function MovementDonut({ counts, activeDays, trackedDays }: {
  counts: Record<string, number>
  activeDays: number
  trackedDays: number
}) {
  const data = MOVEMENT_TYPES.map(({ id, label }) => ({ id, label, value: counts[id] || 0 }))
    .filter((d) => d.value > 0)
  const total = data.reduce((a, d) => a + d.value, 0)
  if (total === 0) return <EmptyState />

  return (
    <div className="space-y-4">
      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="95%"
              paddingAngle={2}
              cornerRadius={4}
              stroke={COLORS.surface}
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((d) => (
                <Cell key={d.id} fill={MOVEMENT_COLORS[d.id]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as { label: string; value: number }
                return <TooltipBox title={d.label}>{d.value} giorni</TooltipBox>
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="stat text-4xl">
            {activeDays}
            <span className="text-lg font-bold text-faint">/{trackedDays}</span>
          </div>
          <div className="label mt-2">Giorni attivi</div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {data.map((d) => (
          <li key={d.id} className="flex items-center gap-2 text-sm">
            <Swatch color={MOVEMENT_COLORS[d.id]} />
            <span className="flex-1 text-muted">{d.label}</span>
            <span className="font-bold tabular-nums text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// How often each stimulation level shows up together with each mood
export function StimulationMoodMatrix({ counts }: { counts: Record<string, Record<string, number>> }) {
  const max = Math.max(0, ...STIMULATION_ORDER.flatMap((s) => MOOD_ORDER.map((m) => counts[s]?.[m] || 0)))
  if (max === 0) return <EmptyState />

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border-separate" style={{ borderSpacing: 4 }}>
          <thead>
            <tr>
              <th />
              {MOOD_ORDER.map((m) => (
                <th key={m} className="pb-1 text-xs font-medium text-muted">
                  <MoodIcon mood={m} />
                  {MOODS[m].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STIMULATION_ORDER.map((s) => (
              <tr key={s}>
                <th className="whitespace-nowrap pr-2 text-right text-xs font-medium text-muted">
                  {STIMULATION_LEVELS[s].label}
                </th>
                {MOOD_ORDER.map((m) => {
                  const count = counts[s]?.[m] || 0
                  const t = count / max
                  return (
                    <td
                      key={m}
                      title={`Stimolazione ${STIMULATION_LEVELS[s].label.toLowerCase()} · ${MOODS[m].label}: ${count} giorni`}
                      className="h-12 rounded-lg text-center text-sm font-bold tabular-nums"
                      style={{
                        backgroundColor: count === 0 ? COLORS.empty : mix(COLORS.heat1, 0.2 + 0.8 * t),
                        color: count === 0 ? COLORS.faint : t > 0.45 ? COLORS.heat1Text : COLORS.ink,
                      }}
                    >
                      {count}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>Meno giorni</span>
        <div className="h-2 w-24 rounded-full" style={{ background: `linear-gradient(to right, ${mix(COLORS.heat1, 0.2)}, ${COLORS.heat1})` }} />
        <span>Più giorni</span>
      </div>
    </div>
  )
}

export interface Correlation {
  a: string
  b: string
  r: number | null
  n: number
}

// Pearson correlation between every pair of metrics
export function CorrelationMatrix({ labels, correlations }: { labels: string[]; correlations: Correlation[] }) {
  if (!correlations.some((c) => c.r !== null)) return <EmptyState />

  const find = (a: string, b: string) => correlations.find((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a))

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border-separate" style={{ borderSpacing: 4 }}>
          <thead>
            <tr>
              <th />
              {labels.map((l) => (
                <th key={l} className="whitespace-nowrap pb-1 text-xs font-medium text-muted">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((row, i) => (
              <tr key={row}>
                <th className="whitespace-nowrap pr-2 text-right text-xs font-medium text-muted">{row}</th>
                {labels.map((col, j) => {
                  if (i === j) return <td key={col} className="h-11 rounded-lg" style={{ backgroundColor: COLORS.empty }} />
                  const c = find(row, col)
                  const r = c?.r ?? null
                  const strength = r === null ? 0 : Math.abs(r)
                  const bg =
                    r === null
                      ? COLORS.empty
                      : r >= 0
                        ? mix(COLORS.heat1, strength)
                        : mix(COLORS.heat2, strength)
                  return (
                    <td
                      key={col}
                      title={
                        r === null
                          ? `${row} / ${col}: dati insufficienti`
                          : `${row} / ${col}: r = ${r.toFixed(2)} su ${c?.n} giorni`
                      }
                      className="h-11 rounded-lg text-center text-xs font-bold tabular-nums"
                      style={{
                        backgroundColor: bg,
                        color: r === null ? COLORS.faint : strength <= 0.5 ? COLORS.ink : r >= 0 ? COLORS.heat1Text : COLORS.heat2Text,
                      }}
                    >
                      {r === null ? '–' : r.toFixed(2)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3">
        <LegendItem color={COLORS.heat2} label="Direzioni opposte" round={false} />
        <LegendItem color={COLORS.empty} label="Nessun legame" round={false} />
        <LegendItem color={COLORS.heat1} label="Salgono insieme" round={false} />
      </div>
    </div>
  )
}
