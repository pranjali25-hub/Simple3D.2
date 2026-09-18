/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flat dark color palette inspired by Nomad Sculpt
        workspace: {
          dark: '#121212',
          panel: '#1e1e1e',
          button: '#2a2a2a',
          hover: '#3a3a3a',
          accent: '#4f46e5', // violet accent for selections/actions
        }
      }
    },
  },
  plugins: [],
}
