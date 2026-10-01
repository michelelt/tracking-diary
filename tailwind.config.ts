import type { Config } from 'tailwindcss'

// Every color is a CSS variable defined in app/globals.css (day + night)
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
        raised: token('raised'),
        line: {
          DEFAULT: token('line'),
          strong: token('line-strong'),
        },
        ink: token('ink'),
        muted: token('muted'),
        faint: token('faint'),
        accent: {
          DEFAULT: token('accent'), // decorative marks
          strong: token('accent-strong'), // primary button fill
          fg: token('accent-fg'), // text on accent-strong
          text: token('accent-text'), // accent-colored text on bg
        },
        success: token('success'),
        danger: {
          DEFAULT: token('danger'),
          fg: token('danger-fg'),
        },
        mood: {
          basso: token('mood-basso'),
          neutro: token('mood-neutro'),
          buono: token('mood-buono'),
          molto: token('mood-molto'),
          fg: token('mood-fg'),
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        control: '12px',
        card: '20px',
      },
      boxShadow: {
        // Composes with ring-*
        'mood-edge': 'inset 0 0 0 1px rgb(var(--mood-edge))',
        float: '0 10px 24px -8px rgb(var(--shadow) / 0.35)',
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
