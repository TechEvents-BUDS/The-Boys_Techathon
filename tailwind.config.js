/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",  // Include all pages
    "./src/**/*.{js,ts,jsx,tsx}",    // Include src folder
    "./components/**/*.{js,ts,jsx,tsx}", // Include components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};


