import type { Config } from 'tailwindcss'

// Every color is a CSS variable defined in app/globals.css (light + dark)
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.ts', // mood colors live in lib/constants.ts
  ],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        faint: token('faint'),
        accent: {
          DEFAULT: token('accent'),
          fg: token('accent-fg'), // text on an accent fill
          text: token('accent-text'), // accent-colored text on bg
          soft: token('accent-soft'),
        },
        success: token('success'),
        danger: {
          DEFAULT: token('danger'),
          fg: token('danger-fg'),
        },
        mood: {
          basso: token('mood-basso'),
          'basso-fg': token('mood-basso-fg'),
          neutro: token('mood-neutro'),
          'neutro-fg': token('mood-neutro-fg'),
          buono: token('mood-buono'),
          'buono-fg': token('mood-buono-fg'),
          molto: token('mood-molto'),
          'molto-fg': token('mood-molto-fg'),
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        control: '12px',
        card: '20px',
      },
      letterSpacing: {
        label: '0.14em',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        rise: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        pop: 'pop 280ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        rise: 'rise 240ms ease-out both',
      },
    },
  },
  plugins: [],
}
export default config
