/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Questrial', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '700': '700ms'
      }
    },
  },
  plugins: [],
};