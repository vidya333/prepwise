/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.8rem', { lineHeight: '1.5' }],
        sm: ['0.925rem', { lineHeight: '1.6' }],
        base: ['1.05rem', { lineHeight: '1.7' }],
        lg: ['1.2rem', { lineHeight: '1.6' }],
        xl: ['1.35rem', { lineHeight: '1.5' }],
        '2xl': ['1.6rem', { lineHeight: '1.4' }],
      },
      colors: {
        orange: {
          50:  '#EEEDFE',
          100: '#CECBF6',
          200: '#AFA9EC',
          300: '#9F99E8',
          400: '#7F77DD',
          500: '#534AB7',
          600: '#3C3489',
          700: '#2E2870',
          800: '#221E55',
          900: '#16123A',
        },
        teal: {
          50: '#E1F5EE',
          100: '#9FE1CB',
          400: '#1D9E75',
          600: '#0F6E56',
          800: '#085041',
        },
      },
    },
  },
  plugins: [],
}
