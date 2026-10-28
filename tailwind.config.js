/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: require('./src/theme/colors'),
      fontFamily: {
        display: ['SpaceGrotesk_700Bold'],
        mono: ['SpaceGrotesk_500Medium'],
        body: ['Manrope_400Regular'],
        'body-bold': ['Manrope_700Bold'],
      },
    },
  },
  plugins: [],
};
