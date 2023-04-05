module.exports = {
  darkMode: ['class', '[data-mode="dark"]'],
  important: true,
  theme: {
    extend: {
        // that is animation class
        animation: {
            fade: 'fadeOut 1s ease-in-out',
        },

        // that is actual animation
        keyframes: theme => ({
            fadeOut: {
                '0%': { opacity: 0 },
                '100%': { opacity: 1 },
            },
        }),
    },
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [require('daisyui')],
  prefix: '',
  daisyui: {
      darkTheme: "dark",
      themes: [],
  },
};
