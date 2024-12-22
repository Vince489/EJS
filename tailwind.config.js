/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/views/**/*.{ejs,html}', // Include all your EJS files
  ],
  theme: {
    extend: {},
  },
  plugins: [require('tailwind-scrollbar')],
};
