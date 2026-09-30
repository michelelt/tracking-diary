'use client'

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
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

export function EmptyState({ message = 'Non ci sono ancora abbastanza dati' }: { message?: string }) {
  return (
    <div className="h-48 flex items-center justify-center text-sm text-slate-400 text-center px-4">
      {message}
    </div>
  )
}

export function TooltipBox({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      {title && <div className="font-semibold text-slate-900 mb-1 capitalize">{title}</div>}
      <div className="space-y-0.5 text-slate-600">{children}</div>
    </div>
  )
}

export function Swatch({ color, round = true }: { color: string; round?: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 shrink-0 ${round ? 'rounded-full' : 'rounded-sm'}`}
      style={{ backgroundColor: color }}
    />
  )
}

export function LegendItem({ color, label, round }: { color: string; label: string; round?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
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
