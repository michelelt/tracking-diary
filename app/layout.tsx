import type { Metadata, Viewport } from 'next'
import { SessionProvider } from 'next-auth/react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Runs before first paint: the saved choice wins, otherwise the system preference.
// A saved choice also gets its own theme-color meta, placed ahead of the media-based ones
// (which React owns). ThemeToggle calls window.__applyTheme after changing the choice.
const themeScript = `(function(){var r=document.documentElement,q=matchMedia('(prefers-color-scheme: dark)')
function apply(){var t;try{t=localStorage.getItem('theme')}catch(e){}
r.dataset.theme=(t?t==='dark':q.matches)?'dark':'light'
var m=document.getElementById('theme-color-override'),c=getComputedStyle(r).getPropertyValue('--bg').trim()
if(!t||!c){if(m)m.remove();return}
if(!m){m=document.createElement('meta');m.id='theme-color-override';m.name='theme-color';document.head.prepend(m)}
m.content='rgb('+c.split(' ').join(', ')+')'}
apply();q.addEventListener('change',apply);addEventListener('DOMContentLoaded',apply);window.__applyTheme=apply})()`

export const metadata: Metadata = {
  title: 'How Are You — Diario Minimale',
  description: 'Traccia le tue 6 metriche personali in 2 minuti al giorno',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HAY',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // --bg of each theme in app/globals.css
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF6EE' },
    { media: '(prefers-color-scheme: dark)', color: '#12142B' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* suppressHydrationWarning: browser extensions add attributes to <body> */}
      <body
        className="bg-bg font-sans text-ink"
        suppressHydrationWarning
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
