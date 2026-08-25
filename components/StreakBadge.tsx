'use client'

interface StreakBadgeProps {
  streak: number
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent dark:bg-accent/20">
      <span className="text-lg">🔥</span>
      {streak} giorni consecutivi
    </div>
  )
}
