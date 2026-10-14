/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Urbanist (DESIGN_SPEC §1.1). React Native exige uma família por peso.
      fontFamily: {
        u: ['Urbanist_400Regular'],
        'u-md': ['Urbanist_500Medium'],
        'u-sb': ['Urbanist_600SemiBold'],
        'u-b': ['Urbanist_700Bold'],
      },
      colors: {
        // Tokens do site qls-website-rust.vercel.app
        ink: { DEFAULT: '#0e0e0e', 2: '#181818', 3: '#222222' },
        paper: '#f6f4f0',
        glow: '#d9b277',
        // Tokens do DESIGN_SPEC §1.2
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
      },
      borderRadius: {
        'r-s': '8px',
        'r-m': '16px',
        'r-l': '24px',
      },
    },
  },
  plugins: [],
};
