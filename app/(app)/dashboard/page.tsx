'use client'

import Navigation from '@/components/Navigation'
import { MOODS, MOVEMENT_TYPES } from '@/lib/constants'
import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts'

interface DashboardData {
  dailyTrends: Array<{
    date: string
    mood?: string
    energy?: number
    sleep?: number
  }>
  moodDistribution: Array<{ name: string; value: number; emoji: string }>
  movementFrequency: Array<{ name: string; value: number; emoji: string }>
  weeklyStats: Array<{
    week: string
    entries: number
    avgEnergy: number
    avgSleep: number
  }>
  stats: {
    totalEntries: number
    currentStreak: number
    avgEnergy: number
    avgSleep: number
    bestMood: string
  }
}

const MOOD_COLORS: Record<string, string> = {
  basso: '#ef4444',
  neutro: '#6b7280',
  buono: '#10b981',
  molto_buono: '#059669',
}

const ENERGY_COLOR = '#8b5cf6'
const SLEEP_COLOR = '#f59e0b'
const MOVEMENT_COLOR = '#06b6d4'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/dashboard')
        if (res.ok) {
          const dashboardData = await res.json()
          setData(dashboardData)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-24">
          <div className="text-center py-12">Caricamento dashboard...</div>
        </div>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-24">
          <div className="text-center py-12">Nessun dato disponibile</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900 pb-24">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              📊 Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Una panoramica completa del tuo benessere
            </p>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Totale Entry
              </div>
              <div className="text-4xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                {data.stats.totalEntries}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
              <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                Streak 🔥
              </div>
              <div className="text-4xl font-bold text-red-900 dark:text-red-100 mt-2">
                {data.stats.currentStreak}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                Energia Media
              </div>
              <div className="text-4xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                {data.stats.avgEnergy.toFixed(1)}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
              <div className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                Sonno Medio
              </div>
              <div className="text-4xl font-bold text-amber-900 dark:text-amber-100 mt-2">
                {data.stats.avgSleep.toFixed(1)}h
              </div>
            </div>
          </div>

          {/* Mood Trend */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              😊 Trend Mood (Ultimi 30 giorni)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyTrends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                {Array.from(new Set(data.dailyTrends.map((d) => d.mood).filter(Boolean))).map(
                  (mood) => (
                    <Line
                      key={mood}
                      type="monotone"
                      dataKey={(d: any) => (d.mood === mood ? 1 : null)}
                      stroke={MOOD_COLORS[mood as string] || '#64748b'}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name={MOODS[mood as keyof typeof MOODS]?.label}
                      connectNulls
                    />
                  )
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Energy & Sleep Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy Trend */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                ⚡ Trend Energia
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.dailyTrends}>
                  <defs>
                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ENERGY_COLOR} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={ENERGY_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stroke={ENERGY_COLOR}
                    fillOpacity={1}
                    fill="url(#colorEnergy)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sleep Trend */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                😴 Trend Sonno
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.dailyTrends}>
                  <defs>
                    <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SLEEP_COLOR} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={SLEEP_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sleep"
                    stroke={SLEEP_COLOR}
                    fillOpacity={1}
                    fill="url(#colorSleep)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Distribution */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                😊 Distribuzione Mood
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.moodDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value) => [value, 'Occorrenze']}
                  />
                  <Bar
                    dataKey="value"
                    fill={MOOD_COLORS.buono}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Movement Frequency */}
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                🏃 Frequenza Movimento
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.movementFrequency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value) => [value, 'Volte']}
                  />
                  <Bar
                    dataKey="value"
                    fill={MOVEMENT_COLOR}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              📈 Statistiche Settimanali
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="entries" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Entry" />
                <Bar
                  dataKey="avgEnergy"
                  fill={ENERGY_COLOR}
                  radius={[8, 8, 0, 0]}
                  name="Energia Media"
                />
                <Bar
                  dataKey="avgSleep"
                  fill={SLEEP_COLOR}
                  radius={[8, 8, 0, 0]}
                  name="Sonno Medio"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  )
}
