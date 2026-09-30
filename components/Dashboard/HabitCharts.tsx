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

function mix(from: string, to: string, t: number): string {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const a = parse(from)
  const b = parse(to)
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`
}

// Part-to-whole of movement types, with active days in the center
export function MovementDonut({ counts, activeDays, trackedDays }: {
  counts: Record<string, number>
  activeDays: number
  trackedDays: number
}) {
  const data = MOVEMENT_TYPES.map(({ id, label, emoji }) => ({ id, label: `${emoji} ${label}`, value: counts[id] || 0 }))
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
              stroke="#fff"
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
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {activeDays}
            <span className="text-base font-medium text-slate-400">/{trackedDays}</span>
          </div>
          <div className="text-xs text-slate-500">giorni attivi</div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {data.map((d) => (
          <li key={d.id} className="flex items-center gap-2 text-sm">
            <Swatch color={MOVEMENT_COLORS[d.id]} />
            <span className="flex-1 text-slate-700 dark:text-slate-300">{d.label}</span>
            <span className="text-slate-500 tabular-nums">{d.value}</span>
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
                <th key={m} className="text-xs font-medium text-slate-500 pb-1">
                  <div className="text-lg">{MOODS[m].emoji}</div>
                  {MOODS[m].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STIMULATION_ORDER.map((s) => (
              <tr key={s}>
                <th className="text-xs font-medium text-slate-500 text-right pr-2 whitespace-nowrap">
                  {STIMULATION_LEVELS[s].label}
                </th>
                {MOOD_ORDER.map((m) => {
                  const count = counts[s]?.[m] || 0
                  const t = count / max
                  return (
                    <td
                      key={m}
                      title={`Stimolazione ${STIMULATION_LEVELS[s].label.toLowerCase()} · ${MOODS[m].label}: ${count} giorni`}
                      className="h-12 rounded-md text-center text-sm font-semibold transition-transform hover:scale-105"
                      style={{
                        backgroundColor: count === 0 ? COLORS.empty : mix('#cde2fb', '#104281', t),
                        color: count === 0 ? '#cbd5e1' : t > 0.45 ? '#fff' : '#0d366b',
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
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Meno giorni</span>
        <div className="h-2 w-24 rounded-full" style={{ background: 'linear-gradient(to right, #cde2fb, #104281)' }} />
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
                <th key={l} className="text-xs font-medium text-slate-500 pb-1 whitespace-nowrap">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((row, i) => (
              <tr key={row}>
                <th className="text-xs font-medium text-slate-500 text-right pr-2 whitespace-nowrap">{row}</th>
                {labels.map((col, j) => {
                  if (i === j) return <td key={col} className="h-11 rounded-md" style={{ backgroundColor: COLORS.empty }} />
                  const c = find(row, col)
                  const r = c?.r ?? null
                  const strength = r === null ? 0 : Math.abs(r)
                  const bg =
                    r === null
                      ? COLORS.empty
                      : r >= 0
                        ? mix('#f0efec', '#184f95', strength)
                        : mix('#f0efec', '#c43534', strength)
                  return (
                    <td
                      key={col}
                      title={
                        r === null
                          ? `${row} / ${col}: dati insufficienti`
                          : `${row} / ${col}: r = ${r.toFixed(2)} su ${c?.n} giorni`
                      }
                      className="h-11 rounded-md text-center text-xs font-semibold tabular-nums"
                      style={{ backgroundColor: bg, color: r === null ? '#cbd5e1' : strength > 0.5 ? '#fff' : '#334155' }}
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
        <LegendItem color="#c43534" label="Vanno in direzioni opposte" round={false} />
        <LegendItem color="#f0efec" label="Nessun legame" round={false} />
        <LegendItem color="#184f95" label="Salgono insieme" round={false} />
      </div>
    </div>
  )
}
