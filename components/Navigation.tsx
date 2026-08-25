'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { href: '/today', label: 'Oggi', emoji: '📝' },
    { href: '/calendar', label: 'Calendario', emoji: '📅' },
    { href: '/dashboard', label: 'Dashboard', emoji: '📊' },
    { href: '/records', label: 'Record', emoji: '📋' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/today" className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Baseline
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-accent text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span className="mr-1">{item.emoji}</span> {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden btn-ghost px-3 py-2"
            >
              ☰
            </button>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="btn-secondary text-sm px-3 py-2"
            >
              Logout
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mt-3 flex flex-col gap-2 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-accent text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span className="mr-1">{item.emoji}</span> {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
