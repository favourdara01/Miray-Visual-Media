/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
  
  theme: {
    extend: {
      colors: {
        primary: "#0B0B0B",
        accent: "#D4AF37",
      },
    },
  },
  plugins: [],
}