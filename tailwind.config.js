/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "nueva": '#22c55e',
        "primer-recap": '#0080ff',
        "segundo-recap": '#ff00bf',
        "tercer-recap": '#bf00ff',
        "descartada": '#ef4444',
        "vehiculo": '#b2f2bb',
        "cubierta": '#a5d8ff',
      },
    },
  },
  plugins: [],
  mode: 'jit',
}
