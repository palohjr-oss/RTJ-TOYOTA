/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        toyota: {
          red: '#EB0A1E',
          darkRed: '#C20818',
          lightRed: '#FEE2E2',
          black: '#111111',
          silver: '#E5E7EB',
          navy: {
            950: '#090D16',
            900: '#0F172A',
            800: '#1E293B',
            700: '#334155',
          }
        },
        status: {
          completed: '#10B981', // green
          scheduled: '#3B82F6', // blue
          pending: '#F59E0B',   // orange/amber
          rescheduled: '#EF4444' // red
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'toyota': '0 4px 14px 0 rgba(235, 10, 30, 0.35)',
      }
    },
  },
  plugins: [],
}
