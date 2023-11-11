/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: [],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'reddit-primary-dark': '#0b1416',
        'reddit-secondary-dark': '#04090a',
        'reddit-highlight-dark': '#1a282d',
        'reddit-text-title-dark': '#f2f4f5',
        'reddit-text-body-dark': '#b8c5c9',
        'reddit-link-dark': '#b8c5c9',
      }
    }
  },
  plugins: [],
}

