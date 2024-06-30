/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      gridTemplateRows: {
        20: 'repeat(20, 1fr) ',
      },
    },
  },
  plugins: [],
}
