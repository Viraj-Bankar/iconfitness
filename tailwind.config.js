/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          black: '#080808',
          charcoal: '#171717',
          deepCharcoal: '#222222',
          red: '#ED101B',
          darkRed: '#B9000B',
          white: '#FFFFFF',
          muted: '#A1A1A1',
          border: '#303030',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Anton', 'Oswald', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle-red': '0 4px 20px -2px rgba(237, 16, 27, 0.25)',
        'minimal-card': '0 2px 10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
