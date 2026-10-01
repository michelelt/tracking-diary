'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/today', label: 'Oggi' },
    { href: '/calendar', label: 'Calendario' },
    { href: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6 dark:border-slate-700 dark:bg-slate-900/90">
      {/* On mobile the links wrap onto their own full-width row, always visible */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6">
        <Link
          href="/today"
          className="flex items-baseline gap-1.5 py-3 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
        >
          <span aria-hidden="true" className="h-1 w-4 rounded-full bg-accent" />
          Baseline
        </Link>

        <nav
          aria-label="Principale"
          className="order-last flex w-full gap-1 pb-2 md:order-none md:w-auto md:flex-1 md:pb-0"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              className={`flex min-h-[40px] flex-1 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors md:flex-none ${
                pathname === item.href
                  ? 'bg-accent-soft text-accent-hover'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn-ghost -mr-3">
          Esci
        </button>
      </div>
    </header>
  )
}
