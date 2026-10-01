'use client'

import { useEffect, useRef, useState } from 'react'

const DURATION = 600

// Counts from the previous value to `value` whenever it changes
export default function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      from.current = value
      setShown(value)
      return
    }

    const start = from.current
    const startedAt = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - startedAt) / DURATION)
      const current = start + (value - start) * (1 - (1 - t) ** 3) // ease-out
      from.current = current
      setShown(current)
      if (t < 1) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{shown.toFixed(decimals)}</>
}
