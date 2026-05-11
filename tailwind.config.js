/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#1a1814',
          2: '#4a4743',
          3: '#8a8784',
          4: '#c4c2bf',
        },
        surface: {
          DEFAULT: '#faf9f7',
          2: '#f2f0ec',
          3: '#e8e5e0',
        },
        brand: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
        },
      },
      maxWidth: { content: '860px' },
    },
  },
  plugins: [],
}
