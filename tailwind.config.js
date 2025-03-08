/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#e74c3c',
        light: {
          background: '#f7fafc',
          surface: '#edf2f7', 
          text: '#2d3748'
        },
        dark: {
          background: '#1a202c',
          surface: '#2d3748',
          text: '#e2e8f0'
        }
      }
    },
  },
  plugins: [],
} 