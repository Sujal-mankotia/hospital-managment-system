/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        bg: '#F5F8FB',
        surface: '#FFFFFF',
        surfaceDark: '#0F1720',
        bgDark: '#0B121A',
        ink: '#101828',
        slate: {
          DEFAULT: '#475569',
          light: '#64748B',
        },
        line: '#E2E8F0',
        primary: {
          DEFAULT: '#0F6FDE',
          dark: '#0B4FA3',
          light: '#E8F1FD',
        },
        teal: {
          DEFAULT: '#14B8A6',
          light: '#E6FBF8',
        },
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FEF3E2',
        },
        rose: {
          DEFAULT: '#E11D48',
          light: '#FDE8ED',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)',
        cardHover: '0 4px 8px rgba(16,24,40,0.06), 0 12px 28px rgba(16,24,40,0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        pulseline: {
          '0%': { strokeDashoffset: '240' },
          '100%': { strokeDashoffset: '0' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseline: 'pulseline 2.4s linear infinite',
        countUp: 'countUp 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
