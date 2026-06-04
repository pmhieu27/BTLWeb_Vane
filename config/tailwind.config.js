/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        logo: ['"Bodoni Moda"', 'serif'],
        ui: ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        primary: '#0A0A0A',
        secondary: '#FFFFFF',
        gold: '#C9A96E',
        'gold-light': '#E8D5B0',
        'gold-dark': '#A68B5B',
        silver: '#C6C6C6',
        'silver-light': '#F0F0F0',
        ivory: '#FAF8F5',
        charcoal: '#333333',
        muted: '#888888',
        hover: '#f6f1e5',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.04)',
        card: '0 4px 12px rgba(0, 0, 0, 0.06)',
        elevated: '0 8px 30px rgba(0, 0, 0, 0.08)',
        overlay: '0 16px 48px rgba(0, 0, 0, 0.12)',
        gold: '0 4px 20px rgba(201, 169, 110, 0.15)',
        product: '0 8px 32px rgba(0, 0, 0, 0.10)',
        glow: '0 0 40px rgba(201, 169, 110, 0.12)',
      },
      borderRadius: {
        sm: '2px',
        md: '4px',
        lg: '8px',
        xl: '16px',
      },
      zIndex: {
        '60': '60',
        '100': '100',
        '110': '110',
        '120': '120',
        '130': '130',
        '200': '200',
        '9999': '9999',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
