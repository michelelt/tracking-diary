'use client'

import { MOODS } from '@/lib/constants'
import {
  COLORS,
  DashboardEntry,
  MOOD_COLORS,
  MOOD_ORDER,
  formatLongDate,
  formatShortDate,
  weekdayIndex,
} from '@/lib/dashboard'
import { useState } from 'react'
import {
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState, LegendItem, Swatch, TooltipBox } from './ChartCard'

const moodLabel = (mood?: string | null) => {
  return MOODS[mood as keyof typeof MOODS]?.label ?? null
}

// GitHub-style heatmap: one cell per day, colored by mood
export function MoodHeatmap({ days, byDate }: { days: string[]; byDate: Map<string, DashboardEntry> }) {
  const [hovered, setHovered] = useState<string | null>(null)

  if (days.length === 0) return <EmptyState />

  const padding = weekdayIndex(days[0])
  const cells: (string | null)[] = [...Array(padding).fill(null), ...days]
  const weeks = Math.ceil(cells.length / 7)
  const size = weeks <= 6 ? 30 : weeks <= 14 ? 20 : 13

  // Month label above the first column that contains a day of that month
  const monthLabels: (string | null)[] = []
  let lastMonth = ''
  for (let w = 0; w < weeks; w++) {
    const firstDay = cells.slice(w * 7, w * 7 + 7).find(Boolean)
    const month = firstDay ? firstDay.slice(0, 7) : ''
    if (month && month !== lastMonth) {
      monthLabels.push(
        new Date(month + '-01T00:00:00Z').toLocaleDateString('it-IT', { month: 'short', timeZone: 'UTC' })
      )
      lastMonth = month
    } else {
      monthLabels.push(null)
    }
  }

  const hoveredEntry = hovered ? byDate.get(hovered) : undefined

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-2">
          {/* Weekday labels */}
          <div
            className="grid gap-[3px] pt-5 text-[10px] text-muted"
            style={{ gridTemplateRows: `repeat(7, ${size}px)` }}
          >
            {['Lun', '', 'Mer', '', 'Ven', '', 'Dom'].map((d, i) => (
              <div key={i} className="leading-none flex items-center">
                {d}
              </div>
            ))}
          </div>

          <div>
            {/* Month labels */}
            <div className="flex h-5 gap-[3px] text-[10px] capitalize text-muted">
              {monthLabels.map((label, i) => (
                <div key={i} style={{ width: size }} className="overflow-visible whitespace-nowrap">
                  {label}
                </div>
              ))}
            </div>

            <div
              className="grid grid-flow-col gap-[3px]"
              style={{ gridTemplateRows: `repeat(7, ${size}px)`, gridAutoColumns: `${size}px` }}
            >
              {cells.map((date, i) => {
                if (!date) return <div key={`pad-${i}`} />
                const entry = byDate.get(date)
                const color = entry?.mood ? MOOD_COLORS[entry.mood] : COLORS.empty
                return (
                  <div
                    key={date}
                    onMouseEnter={() => setHovered(date)}
                    onMouseLeave={() => setHovered(null)}
                    title={`${formatLongDate(date)}${entry?.mood ? ' · ' + moodLabel(entry.mood) : ''}`}
                    className={`rounded-[3px] transition-transform duration-200 hover:scale-125 ${
                      hovered === date ? 'ring-2 ring-ink/40' : ''
                    } ${entry?.mood ? 'shadow-mood-edge' : ''}`}
                    style={{
                      backgroundColor: color,
                      width: size,
                      height: size,
                      // Filled in, but without a mood
                      boxShadow: entry && !entry.mood ? `inset 0 0 0 1.5px ${COLORS.axis}` : undefined,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 min-h-[20px]">
        <div className="flex flex-wrap gap-3">
          {MOOD_ORDER.map((mood) => (
            <LegendItem key={mood} color={MOOD_COLORS[mood]} label={moodLabel(mood)!} round={false} />
          ))}
          <LegendItem color={COLORS.empty} label="Non registrato" round={false} />
        </div>
        <div className="text-xs capitalize text-muted">
          {hovered &&
            `${formatLongDate(hovered)} · ${
              hoveredEntry ? moodLabel(hoveredEntry.mood) || 'umore non indicato' : 'non registrato'
            }`}
        </div>
      </div>
    </div>
  )
}

interface MoodPoint {
  date: string
  mood: number | null
  moodKey: string | null
  avg: number | null
}

// Daily mood dots + 7-day moving average
export function MoodTrend({ data }: { data: MoodPoint[] }) {
  if (!data.some((d) => d.mood !== null)) return <EmptyState />

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={COLORS.grid} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 11, fill: COLORS.axis }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={[0.5, 4.5]}
            ticks={[1, 2, 3, 4]}
            tick={({ x, y, payload }: { x: number; y: number; payload: { value: number } }) => {
              const Icon = MOODS[MOOD_ORDER[payload.value - 1]]?.icon
              return Icon ? <Icon x={x - 26} y={y - 9} size={18} color={COLORS.axis} /> : <g />
            }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: COLORS.axis, strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0].payload as MoodPoint
              return (
                <TooltipBox title={formatLongDate(p.date)}>
                  <div>{moodLabel(p.moodKey) || 'Umore non indicato'}</div>
                  {p.avg !== null && <div>Media 7 giorni: {p.avg.toFixed(1)} / 4</div>}
                </TooltipBox>
              )
            }}
          />
          <Line
            dataKey="avg"
            stroke={COLORS.series1}
            strokeWidth={2}
            dot={false}
            activeDot={false}
            connectNulls
            isAnimationActive
          />
          <Scatter
            dataKey="mood"
            shape={(props: { cx?: number; cy?: number; payload?: MoodPoint }) => {
              const { cx, cy, payload } = props
              if (!payload?.moodKey || cx === undefined || cy === undefined) return <g />
              return <circle cx={cx} cy={cy} r={5} fill={MOOD_COLORS[payload.moodKey]} stroke={COLORS.moodEdge} strokeWidth={1.5} />
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3">
        <LegendItem color={COLORS.series1} label="Media a 7 giorni" />
        {MOOD_ORDER.map((mood) => (
          <LegendItem key={mood} color={MOOD_COLORS[mood]} label={moodLabel(mood)!} />
        ))}
      </div>
    </div>
  )
}

// Part-to-whole of moods, with the share of good days in the center
export function MoodDonut({ counts }: { counts: Record<string, number> }) {
  const data = MOOD_ORDER.map((mood) => ({ mood, value: counts[mood] || 0 })).filter((d) => d.value > 0)
  const total = data.reduce((a, d) => a + d.value, 0)
  if (total === 0) return <EmptyState />

  const good = (counts.buono || 0) + (counts.molto_buono || 0)

  return (
    <div className="space-y-4">
      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="mood"
              innerRadius="68%"
              outerRadius="95%"
              paddingAngle={2}
              cornerRadius={4}
              stroke={COLORS.moodEdge}
              strokeWidth={1}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((d) => (
                <Cell key={d.mood} fill={MOOD_COLORS[d.mood]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as { mood: string; value: number }
                return (
                  <TooltipBox title={moodLabel(d.mood)!}>
                    {d.value} giorni · {Math.round((d.value / total) * 100)}%
                  </TooltipBox>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="stat text-4xl">
            {Math.round((good / total) * 100)}
            <span className="text-lg font-bold text-faint">%</span>
          </div>
          <div className="label mt-2">Giorni positivi</div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {data.map((d) => (
          <li key={d.mood} className="flex items-center gap-2 text-sm">
            <Swatch color={MOOD_COLORS[d.mood]} />
            <span className="flex-1 text-muted">{moodLabel(d.mood)}</span>
            <span className="font-bold tabular-nums text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
