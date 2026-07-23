/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Excalidraw palette — matches the illustrations exactly
        ink: '#1e1e1e',
        paper: '#FBFAF6',
        panel: '#FFFFFF',
        accent: '#f08c00', // orange — the one accent, used sparingly
        accentink: '#c26a00',
        marker: '#ffec99', // highlighter swipe
        sky: '#1971c2',
        grass: '#2f9e44',
        crimson: '#e03131',
        smoke: '#868e96',
        hair: '#e7e3d8', // hairline borders
      },
      fontFamily: {
        // Virgil = the Excalidraw handwriting font, loaded from the bundled ttf.
        hand: ['Virgil', 'Comic Sans MS', 'cursive'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(30,30,30,0.04), 0 10px 30px -18px rgba(30,30,30,0.35)',
        lift: '0 18px 48px -24px rgba(30,30,30,0.45)',
        marker: 'inset 0 -0.55em 0 #ffec99',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        dashdraw: {
          to: { 'stroke-dashoffset': '0' },
        },
        fadeup: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        fadeup: 'fadeup 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
