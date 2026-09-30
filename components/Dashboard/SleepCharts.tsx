'use client'

import { MOODS } from '@/lib/constants'
import {
  COLORS,
  MOOD_COLORS,
  MOOD_ORDER,
  formatLongDate,
  formatShortDate,
  linearFit,
  mean,
  minutesToTime,
} from '@/lib/dashboard'
import { useState } from 'react'
import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState, LegendItem, TooltipBox, useWidth } from './ChartCard'

export interface Night {
  date: string
  bed: number // minutes, times after midnight shifted by +24h
  wake: number
  hours: number | null
}

const HEIGHT = 280
const MARGIN = { top: 12, right: 64, bottom: 28, left: 44 }

// Dumbbell per night: from bedtime (top) to wake-up (bottom)
export function SleepSchedule({ nights }: { nights: Night[] }) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hovered, setHovered] = useState<number | null>(null)

  if (nights.length === 0) return <EmptyState message="Aggiungi gli orari del sonno per vedere questo grafico" />

  const minY = Math.floor((Math.min(...nights.map((n) => n.bed)) - 30) / 60) * 60
  const maxY = Math.ceil((Math.max(...nights.map((n) => n.wake)) + 30) / 60) * 60
  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right)
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom
  const band = nights.length > 0 ? plotW / nights.length : 0
  const x = (i: number) => MARGIN.left + band * i + band / 2
  const y = (m: number) => MARGIN.top + ((m - minY) / (maxY - minY)) * plotH

  const hourStep = maxY - minY > 10 * 60 ? 120 : 60
  const ticks: number[] = []
  for (let t = minY; t <= maxY; t += hourStep) ticks.push(t)

  const avgBed = mean(nights.map((n) => n.bed))!
  const avgWake = mean(nights.map((n) => n.wake))!
  const capsule = Math.max(2, Math.min(8, band * 0.45))
  const dotR = Math.max(2.5, Math.min(5, band * 0.3))
  const labelEvery = Math.max(1, Math.ceil(56 / Math.max(band, 1)))
  const h = hovered !== null ? nights[hovered] : null

  return (
    <div className="space-y-3">
      <div ref={ref} className="relative" style={{ height: HEIGHT }}>
        {width > 0 && (
          <svg width={width} height={HEIGHT} onMouseLeave={() => setHovered(null)}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} stroke={COLORS.grid} />
                <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={COLORS.axis}>
                  {minutesToTime(t)}
                </text>
              </g>
            ))}

            {/* Averages, labelled on the right */}
            {[
              { v: avgBed, color: COLORS.series1, label: 'a letto' },
              { v: avgWake, color: COLORS.series2, label: 'sveglia' },
            ].map(({ v, color, label }) => (
              <g key={label}>
                <line
                  x1={MARGIN.left}
                  x2={width - MARGIN.right}
                  y1={y(v)}
                  y2={y(v)}
                  stroke={color}
                  strokeOpacity={0.5}
                />
                <text x={width - MARGIN.right + 6} y={y(v)} dy="-0.2em" fontSize={11} fontWeight={600} fill="#334155">
                  {minutesToTime(v)}
                </text>
                <text x={width - MARGIN.right + 6} y={y(v)} dy="1em" fontSize={10} fill={COLORS.axis}>
                  {label}
                </text>
              </g>
            ))}

            {nights.map((n, i) => (
              <g key={n.date} opacity={hovered === null || hovered === i ? 1 : 0.35}>
                <line
                  x1={x(i)}
                  x2={x(i)}
                  y1={y(n.bed)}
                  y2={y(n.wake)}
                  stroke={COLORS.series1}
                  strokeOpacity={0.25}
                  strokeWidth={capsule}
                  strokeLinecap="round"
                />
                <circle cx={x(i)} cy={y(n.bed)} r={dotR} fill={COLORS.series1} stroke="#fff" strokeWidth={1.5} />
                <circle cx={x(i)} cy={y(n.wake)} r={dotR} fill={COLORS.series2} stroke="#fff" strokeWidth={1.5} />
                {i % labelEvery === 0 && (
                  <text x={x(i)} y={HEIGHT - 8} textAnchor="middle" fontSize={11} fill={COLORS.axis}>
                    {formatShortDate(n.date)}
                  </text>
                )}
                {/* Hit area: the whole column */}
                <rect
                  x={x(i) - band / 2}
                  y={MARGIN.top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  onMouseEnter={() => setHovered(i)}
                />
              </g>
            ))}
          </svg>
        )}

        {h && hovered !== null && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: Math.min(x(hovered) + 12, width - 180),
              top: Math.max(0, y(h.bed) - 10),
            }}
          >
            <TooltipBox title={formatLongDate(h.date)}>
              <div>A letto: {minutesToTime(h.bed)}</div>
              <div>Sveglia: {minutesToTime(h.wake)}</div>
              {h.hours !== null && <div>Ore dormite: {h.hours}h</div>}
            </TooltipBox>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <LegendItem color={COLORS.series1} label="A letto" />
        <LegendItem color={COLORS.series2} label="Sveglia" />
      </div>
    </div>
  )
}

interface SleepEnergyPoint {
  date: string
  hours: number
  energy: number
  mood: string | null
}

// Does sleeping more give more energy? One dot per day, colored by mood, with a trend line
export function SleepVsEnergy({ points }: { points: SleepEnergyPoint[] }) {
  if (points.length < 3) return <EmptyState message="Servono almeno 3 giorni con sonno ed energia" />

  const fit = linearFit(points.map((p) => [p.hours, p.energy]))
  const xs = points.map((p) => p.hours)
  const minX = Math.floor(Math.min(...xs)) - 0.5
  const maxX = Math.ceil(Math.max(...xs)) + 0.5
  const clampY = (v: number) => Math.max(0, Math.min(10, v))

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.grid} />
          <XAxis
            type="number"
            dataKey="hours"
            domain={[minX, maxX]}
            tickFormatter={(v: number) => `${v}h`}
            tick={{ fontSize: 11, fill: COLORS.axis }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="number"
            dataKey="energy"
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
              const p = payload[0].payload as SleepEnergyPoint
              const mood = MOODS[p.mood as keyof typeof MOODS]
              return (
                <TooltipBox title={formatLongDate(p.date)}>
                  <div>Sonno: {p.hours}h</div>
                  <div>Energia media: {p.energy.toFixed(1)}</div>
                  {mood && (
                    <div>
                      {mood.emoji} {mood.label}
                    </div>
                  )}
                </TooltipBox>
              )
            }}
          />
          {fit && (
            <ReferenceLine
              segment={[
                { x: minX, y: clampY(fit.intercept + fit.slope * minX) },
                { x: maxX, y: clampY(fit.intercept + fit.slope * maxX) },
              ]}
              stroke="#475569"
              strokeWidth={1.5}
              strokeOpacity={0.6}
              ifOverflow="hidden"
            />
          )}
          <Scatter data={points}>
            {points.map((p) => (
              <Cell
                key={p.date}
                fill={p.mood ? MOOD_COLORS[p.mood] : COLORS.none}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3">
        {MOOD_ORDER.map((mood) => (
          <LegendItem key={mood} color={MOOD_COLORS[mood]} label={MOODS[mood].label} />
        ))}
        <LegendItem color="#475569" label="Tendenza" round={false} />
      </div>
    </div>
  )
}
