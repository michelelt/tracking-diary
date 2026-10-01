import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.ts', // mood colors live in lib/constants.ts
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#0e7490', // cyan-700, AA with white text
          hover: '#155e75', // cyan-800
          soft: '#ecfeff', // cyan-50
        },
        success: '#059669', // emerald-600
        warning: '#d97706', // amber-600
        danger: '#dc2626', // red-600
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.06)',
        raised: '0 4px 16px rgb(15 23 42 / 0.08)',
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

