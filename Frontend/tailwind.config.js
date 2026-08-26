/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'trade-bg': '#0a0e17',
        'trade-card': '#111827',
        'trade-border': '#1f2937',
        'trade-green': '#00c853',
        'trade-red': '#ff1744',
        'trade-yellow': '#ffab00',
      }
    },
  },
  plugins: [],
}