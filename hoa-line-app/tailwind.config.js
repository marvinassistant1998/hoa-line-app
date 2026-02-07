/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        line: {
          DEFAULT: '#06C755',
          dark: '#05A847',
        },
        ios: {
          gray: {
            50: '#F5F5F7',
            100: '#E8E8ED',
            400: '#C7C7CC',
            500: '#86868B',
            900: '#1D1D1F',
          },
          red: '#FF3B30',
          orange: '#FF9500',
          green: '#34C759',
          blue: '#007AFF',
          purple: '#AF52DE',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
