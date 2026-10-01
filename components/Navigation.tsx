'use client'

import { CalendarDays, ChartNoAxesColumn, LogOut, Moon, PenLine, Sun, SunMoon, Users } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const THEMES = {
  system: { label: 'Tema: come il sistema', icon: SunMoon },
  light: { label: 'Tema: giorno', icon: Sun },
  dark: { label: 'Tema: notte', icon: Moon },
}
type Theme = keyof typeof THEMES
const THEME_ORDER: Theme[] = ['system', 'light', 'dark']

// Cycles system -> day -> night. The choice lives in localStorage; the inline script in app/layout.tsx applies it.
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') setTheme(saved)
  }, [])

  const Icon = THEMES[theme].icon

  const cycle = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]
    if (next === 'system') localStorage.removeItem('theme')
    else localStorage.setItem('theme', next)
    ;(window as unknown as { __applyTheme: () => void }).__applyTheme()
    setTheme(next)
  }

  return (
    <button onClick={cycle} aria-label={THEMES[theme].label} title={THEMES[theme].label} className="btn-ghost !px-3">
      <Icon size={20} aria-hidden="true" />
    </button>
  )
}

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: '/today', label: 'Oggi', icon: PenLine },
    { href: '/calendar', label: 'Calendario', icon: CalendarDays },
    { href: '/dashboard', label: 'Progressi', icon: ChartNoAxesColumn },
    ...((session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ? [{ href: '/admin', label: 'Utenti', icon: Users }] : []),
  ]

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 px-4 backdrop-blur md:px-8">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-8">
          <Link href="/today" aria-label="How Are You" className="flex items-baseline gap-2 text-lg font-black tracking-tight text-ink">
            <span aria-hidden="true" className="h-1 w-5 rounded-full bg-accent" />
            HAY
          </Link>

          <nav aria-label="Principale" className="hidden flex-1 gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={`flex min-h-[44px] items-center rounded-control px-4 text-sm font-semibold transition-colors duration-200 ${
                  pathname === item.href ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                <span className={`border-b-2 py-1 ${pathname === item.href ? 'border-accent' : 'border-transparent'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="-mr-3 flex">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              aria-label="Esci"
              title="Esci"
              className="btn-ghost !px-3"
            >
              <LogOut size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile: tab bar within thumb reach */}
      <nav
        aria-label="Principale"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? 'page' : undefined}
            className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition duration-200 active:scale-[0.97] ${
              pathname === item.href ? 'text-accent-text' : 'text-muted'
            }`}
          >
            <item.icon size={22} strokeWidth={pathname === item.href ? 2.5 : 2} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
