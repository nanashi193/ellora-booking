/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'ivory': {
          50: '#fdfbf7',
          100: '#f9f8f6',
          200: '#efeae0',
        },
        'dusty-pink': {
          400: '#e2aeb1',
          500: '#d49599',
          600: '#c48b8b',
        },
        'charcoal': {
          800: '#3a3836',
          900: '#2c2a29',
        }
      },
      fontFamily: {
        'serif': ['Minion Pro', 'ui-serif', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
