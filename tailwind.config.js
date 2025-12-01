/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // VCB Monochrome Palette - 8 Locked Levels
        vcb: {
          900: '#0a0a0a',  // L1 - Header Area (BLACK)
          800: '#1a1a1a',  // L2 - Card Area
          700: '#2a2a2a',  // L4 - Features Section
          600: '#3a3a3a',  // L5 - Feature Card Area
          500: '#4a4a4a',  // Mid grey
          400: '#6a6a6a',  // Mid grey
          300: '#9a9a9a',  // Text grey
          200: '#e0e0e0',  // L8 - Light Grey Button
          150: '#f0f0f0',  // L6 - Feature Card
          100: '#f5f5f5',  // L3 - Card (WHITE pop)
          50: '#ffffff',   // L7 - Pure White
        },
      },
      fontFamily: {
        sans: ['Quicksand', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Quicksand', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
