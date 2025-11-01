
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: 'class', // ✅ Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          600: '#4F46E5',  // indigo-600
          700: '#4338CA',  // indigo-700
        },
        pending: '#3B82F6',       // blue-400
        inProgress: '#F59E0B',    // yellow-500
        resolved: '#10B981',      // green-500
        rejected: '#DC2626',      // red-600
      },
    },
  },
  plugins: [],
}