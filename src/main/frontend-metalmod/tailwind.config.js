/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        graphite: '#1C1F24',
        steel: '#8A94A3',
        'steel-bg': '#F4F5F7',
        'safety-red': '#C1272D',
        'safety-amber': '#E0972B',
        'safety-green': '#2E7D46',
        'safety-blue': '#2B5C8C',
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        techmono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
