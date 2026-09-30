'use client'

import { COLORS, formatLongDate, formatShortDate } from '@/lib/dashboard'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState, LegendItem, TooltipBox } from './ChartCard'

interface EnergyPoint {
  date: string
  avg: number | null
  range: [number, number] | null
}

// Daily average energy with the min-max spread of the day as a band
export function EnergyBand({ data }: { data: EnergyPoint[] }) {
  if (!data.some((d) => d.avg !== null)) return <EmptyState />

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="energyBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.series1} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORS.series1} stopOpacity={0.08} />
            </linearGradient>
          </defs>
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
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 11, fill: COLORS.axis }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: COLORS.axis, strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0].payload as EnergyPoint
              if (p.avg === null) return null
              return (
                <TooltipBox title={formatLongDate(p.date)}>
                  <div>Media: {p.avg.toFixed(1)} / 10</div>
                  {p.range && p.range[0] !== p.range[1] && (
                    <div>
                      Da {p.range[0]} a {p.range[1]}
                    </div>
                  )}
                </TooltipBox>
              )
            }}
          />
          <Area dataKey="range" stroke="none" fill="url(#energyBand)" activeDot={false} />
          <Line
            dataKey="avg"
            stroke={COLORS.series1}
            strokeWidth={2}
            dot={{ r: 2.5, fill: COLORS.series1, strokeWidth: 0 }}
            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3">
        <LegendItem color={COLORS.series1} label="Energia media del giorno" />
        <LegendItem color="#bfd6f3" label="Minimo - massimo" round={false} />
      </div>
    </div>
  )
}

interface ProfileRow {
  slot: string
  avg: number | null
  [date: string]: number | string | null
}

// How energy moves through the day: each day as a faint line, the average on top
export function EnergyDayProfile({ rows, dates }: { rows: ProfileRow[]; dates: string[] }) {
  if (!rows.some((r) => r.avg !== null)) return <EmptyState />

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={rows} margin={{ top: 24, right: 24, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={COLORS.grid} />
          <XAxis
            dataKey="slot"
            tick={{ fontSize: 12, fill: COLORS.axis }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            padding={{ left: 16, right: 16 }}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 11, fill: COLORS.axis }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: COLORS.axis, strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const row = payload[0].payload as ProfileRow
              if (row.avg === null) return null
              return (
                <TooltipBox title={row.slot}>
                  Media: {row.avg.toFixed(1)} / 10
                </TooltipBox>
              )
            }}
          />
          {dates.map((date) => (
            <Line
              key={date}
              dataKey={date}
              stroke={COLORS.series1}
              strokeOpacity={0.14}
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
          <Line
            dataKey="avg"
            stroke={COLORS.series1}
            strokeWidth={3}
            dot={{ r: 5, fill: COLORS.series1, stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            connectNulls
          >
            <LabelList
              dataKey="avg"
              position="top"
              offset={10}
              formatter={(v: number | null) => (v === null ? '' : v.toFixed(1))}
              style={{ fontSize: 12, fontWeight: 600, fill: '#334155' }}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3">
        <LegendItem color={COLORS.series1} label="Media" />
        <LegendItem color="#c9dcf4" label="Singoli giorni" />
      </div>
    </div>
  )
}

interface WeekdayRow {
  day: string
  energy: number | null
  mood: number | null
  count: number
}

// Weekly rhythm: energy and mood by day of the week, both on a 1-10 scale
export function WeekdayRadar({ data }: { data: WeekdayRow[] }) {
  if (data.filter((d) => d.count > 0).length < 3) return <EmptyState />

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} outerRadius="75%" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <PolarGrid stroke={COLORS.grid} />
          <PolarAngleAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} tickCount={6} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const row = payload[0].payload as WeekdayRow
              return (
                <TooltipBox title={row.day}>
                  {row.energy !== null && <div>Energia: {row.energy.toFixed(1)} / 10</div>}
                  {row.mood !== null && <div>Umore: {row.mood.toFixed(1)} / 10</div>}
                  <div className="text-slate-400">{row.count} giorni</div>
                </TooltipBox>
              )
            }}
          />
          <Radar
            dataKey="energy"
            stroke={COLORS.series1}
            strokeWidth={2}
            fill={COLORS.series1}
            fillOpacity={0.18}
            dot={{ r: 3, fill: COLORS.series1 }}
          />
          <Radar
            dataKey="mood"
            stroke={COLORS.series2}
            strokeWidth={2}
            fill={COLORS.series2}
            fillOpacity={0.12}
            dot={{ r: 3, fill: COLORS.series2 }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 justify-center">
        <LegendItem color={COLORS.series1} label="Energia" />
        <LegendItem color={COLORS.series2} label="Umore (riportato su 1-10)" />
      </div>
    </div>
  )
}
