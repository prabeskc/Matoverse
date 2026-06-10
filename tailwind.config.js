/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep Teal / Cyan — primary brand
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Copper / Rust — accent
        neon: {
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        // Slate dark surfaces — COMPLETE scale
        surface: {
          DEFAULT: '#000000',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#f1f5f9',   // Light — used as bright text on dark bg
          card:    '#0f172a',
          elevated:'#1e293b',
          border:  '#1e293b',
        },
      },
      backgroundImage: {
        'brand-gradient':   'linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #ea580c 100%)',
        'hero-gradient':    'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #f97316 100%)',
        'card-gradient':    'linear-gradient(145deg, rgba(13,148,136,0.07) 0%, rgba(15,118,110,0.03) 100%)',
        'hero-radial':      'radial-gradient(ellipse at 60% 50%, rgba(13,148,136,0.18) 0%, transparent 65%)',
        'neon-gradient':    'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        'carbon-stripe':    'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
        'mesh-gradient':    'radial-gradient(at 40% 20%, rgba(13,148,136,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(249,115,22,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(13,148,136,0.08) 0px, transparent 50%)',
      },
      boxShadow: {
        'brand':    '0 0 25px rgba(13,148,136,0.3)',
        'brand-sm': '0 0 12px rgba(13,148,136,0.25)',
        'brand-lg': '0 0 50px rgba(13,148,136,0.4)',
        'neon':     '0 0 25px rgba(249,115,22,0.3)',
        'card':     '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(13,148,136,0.1)',
        'glow':     '0 0 40px rgba(13,148,136,0.2)',
        'glass':    'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 9s ease-in-out infinite',
        'pulse-slow':   'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up':   'fadeInUp 0.7s ease-out forwards',
        'fade-in':      'fadeIn 0.5s ease-out forwards',
        'slide-down':   'slideDown 0.3s ease-out forwards',
        'slide-up':     'slideUp 0.6s ease-out forwards',
        'spin-slow':    'spin 8s linear infinite',
        'ping-slow':    'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shimmer':      'shimmer 2s infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'gradient-x':   'gradientX 4s ease infinite',
        'border-glow':  'borderGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(13,148,136,0.2)' },
          '50%':      { boxShadow: '0 0 35px rgba(13,148,136,0.5)' },
        },
        gradientX: {
          '0%, 100%': { backgroundSize: '200% 200%', backgroundPosition: 'left center' },
          '50%':      { backgroundSize: '200% 200%', backgroundPosition: 'right center' },
        },
        borderGlow: {
          '0%':   { borderColor: 'rgba(13,148,136,0.2)' },
          '100%': { borderColor: 'rgba(13,148,136,0.6)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
