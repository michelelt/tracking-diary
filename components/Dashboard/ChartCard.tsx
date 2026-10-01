'use client'

import { ChartNoAxesColumn } from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  className?: string
  children: ReactNode
}

export function ChartCard({ title, subtitle, className = '', children }: ChartCardProps) {
  return (
    <div className={`card flex flex-col ${className}`}>
      <div className="mb-6">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export function EmptyState({ message = 'Ancora pochi dati. Registra qualche giorno e torna qui.' }: { message?: string }) {
  return (
    <div className="state h-48">
      <ChartNoAxesColumn size={24} className="text-faint" aria-hidden="true" />
      {message}
    </div>
  )
}

export function TooltipBox({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-control border border-line bg-bg px-3 py-2 text-xs shadow-lg">
      {title && <div className="mb-1 font-bold capitalize text-ink">{title}</div>}
      <div className="space-y-0.5 tabular-nums text-muted">{children}</div>
    </div>
  )
}

export function Swatch({ color, round = true }: { color: string; round?: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 ${round ? 'rounded-full' : 'rounded-sm'}`}
      style={{ backgroundColor: color }}
    />
  )
}

export function LegendItem({ color, label, round }: { color: string; label: string; round?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <Swatch color={color} round={round} />
      {label}
    </span>
  )
}

// Width of a container, for hand-drawn SVG charts
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}
