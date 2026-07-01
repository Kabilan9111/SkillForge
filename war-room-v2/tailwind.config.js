/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: '#050505',
        bgSecondary: '#101010',
        card: '#161616',
        accent: '#FF4D4F',
        success: '#00D97E',
        blue: '#4DA3FF',
        warning: '#FFC857',
        textPrimary: '#FFFFFF',
        textSecondary: '#8B8B8B'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
