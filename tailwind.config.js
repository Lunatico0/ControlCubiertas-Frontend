/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "nueva": '#0000ff',
        "primer-recap": '#1db51d',
        "segundo-recap": '#ffff00',
        "tercer-recap": '#ff8000',
        "recap": '#666666',
        "descartada": '#ef2222',
        "vehiculo": '#b2f2bb',
        "cubierta": '#a5d8ff',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
  mode: 'jit',
}
