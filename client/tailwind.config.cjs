/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      borderColor: {
        border: "hsl(214, 32%, 91%)", // supports `border-border`
      },
      colors: {
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(222.2, 47.4%, 11.2%)",
      }
    },
  },
  plugins: [],
};
