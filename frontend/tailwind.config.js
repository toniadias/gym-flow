/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'gym-dark': '#0A0A0C',
        'gym-purple': '#A855F7',
        'gym-pink': '#EC4899',
      },
    },
  },
  plugins: [],
};
