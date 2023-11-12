/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: [],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'reddit-primary': { // background
          dark: '#0b1416',
          light: '#cee3e7'
        }, 
        'reddit-secondary': { // certain standout element backgrounds
          dark: '#04090a',
          light: '#ebedee'
        }, 
        'reddit-highlight': { // input, hover, active, selected
          dark: '#1a282d',
          light: '#ebedee'
        }, 
        'reddit-neutral-background': {
          dark: '#0f1a1c',
          light: '#f2f4f5'
        },
        'reddit-text-title': {
          dark: '#f2f4f5',
          light: '#0f1a1c'
        },
        'reddit-text-body': {
          dark: '#b8c5c9',
          light: '#0f1a1c'
        },
        'reddit-link': {
          dark: '#b8c5c9',
          light: '#1a282d'
        },
        'reddit-link-hover': {
          dark: '#cee3e7',
          light: '#ebedee'
        }
      }
    }
  },
  plugins: []
}

