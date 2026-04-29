/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1d4ed8',   // School Blue
          secondary: '#15803d', // Success Green
          accent: '#f97316',    // Warning Orange
        }
      }
    },
  },
  plugins: [],
}