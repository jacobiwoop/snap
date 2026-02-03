/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        snap: {
          yellow: "#FFFC00",
          black: "#000000",
          white: "#FFFFFF",
          gray: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ['"Public Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
