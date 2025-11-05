/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,tx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#008080",
        secondary: "#1e3a8a",
        accent: "#c026d3",
      },
      fontFamily: {
        sans: ["Inter","sans-serif"],
      },
    },
  },
  plugins: [],
};

