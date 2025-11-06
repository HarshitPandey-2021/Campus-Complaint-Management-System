/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#4F46E5', // Indigo 600
          700: '#4338CA', // Indigo 700
        },
        neutral: {
          bg: '#F9FAFB', // gray-50
        },
        status: {
          pending: '#1E3A8A', // blue-800
          inprogress: '#854D0E', // yellow-800
          resolved: '#166534', // green-800
          rejected: '#7F1D1D', // red-900
        },
      },
    },
  },
  plugins: [],
}
