/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#c9a84c',
          dark: '#a8843a',
          light: '#e8b86a',
        },
        qls: {
          black: '#0a0a0a',
          ink: '#1a1814',
          dark: '#3a3632',
          grey: '#6f6a64',
          mute: '#9a9590',
          line: '#3a3632',
          light: '#e4e0da',
          off: '#181715',
          white: '#f8f6f2',
        },
        ok: '#3f7a4f',
        warn: '#b7791f',
        err: '#b3382c',
        info: '#2f5d8a',
        primary: {
          50: '#fbf8ea',
          100: '#f5eecc',
          200: '#ebdc9b',
          300: '#dec363',
          400: '#d1aa36',
          500: '#c9a84c',
          600: '#a8843a',
          700: '#855119',
          800: '#6f421b',
          900: '#5f371c',
        }
      }
    },
  },
  plugins: [],
};
