/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      gridTemplateRows: {
        20: 'repeat(20, 1fr) ',
        app: '1fr 5fr 2fr 8fr 2fr 1fr',
      },
      gridRowStart: {
        13: '13',
        14: '14',
        15: '15',
        16: '16',
        17: '17',
        18: '18',
        20: '20',
      },
    },
  },
  plugins: [],
}
