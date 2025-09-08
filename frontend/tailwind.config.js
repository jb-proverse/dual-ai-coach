/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: { 
    extend: {
      screens: {
        'xs': '475px',
      },
    }
  },
  plugins: []
};
