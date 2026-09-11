/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'trade-bg': '#0b0b0c',
        'trade-card': '#12121a',
        'trade-elevated': '#1a1a24',
        'trade-border': '#1f1f2e',
        'trade-border-hover': '#2f2f3e',

        // Accents
        'trade-green': '#00e676',
        'trade-green-dark': '#00b85c',
        'trade-red': '#ff3d57',
        'trade-red-dark': '#d12c42',
        'trade-blue': '#3b82f6',
        'trade-blue-dark': '#2563eb',
        'trade-purple': '#8b5cf6',
        'trade-yellow': '#fbbf24',
        'trade-orange': '#f97316',

        // Text
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'text-tertiary': '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'gradient-green': 'linear-gradient(135deg, #00e676 0%, #00b85c 100%)',
        'gradient-red': 'linear-gradient(135deg, #ff3d57 0%, #d12c42 100%)',
        'gradient-yellow': 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 230, 118, 0.35)',
        'glow-red': '0 0 20px rgba(255, 61, 87, 0.35)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.35)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.35)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}