import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: '#0891b2', // cyan-600
      },
      spacing: {
        safe: 'max(1rem, env(safe-area-inset-bottom))',
      },
      minHeight: {
        touch: '44px',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
export default config
