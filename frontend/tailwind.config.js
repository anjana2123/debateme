/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        champion: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        rival: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        evidence: {
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          500: '#f97316',
          600: '#ea580c',
        }
      },
      backgroundImage: {
        'arena': "radial-gradient(circle at 50% 50%, #2d1b4e 0%, #1a1a1a 100%)",
        'champion-glow': 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
        'rival-glow': 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'champion': '0 0 30px rgba(251,191,36,0.3)',
        'rival': '0 0 30px rgba(239,68,68,0.3)',
        'glow': '0 0 40px rgba(255,255,255,0.1)',
      }
    },
  },
  plugins: [],
}