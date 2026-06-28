/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          50: '#f0f5ff',
          500: '#1e40af', // Azul Premium
          600: '#1e3a8a',
          900: '#0f172a'
        }
      }
    },
  },
  plugins: [],
}