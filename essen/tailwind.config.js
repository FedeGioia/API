/** @type {import('tailwindcss').Config} */
module.exports = {
  
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Asegúrate de que esta línea esté presente
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        'serif': ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};