module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "day-time": "url('@/assets/game/back2.png')",
        "night-time": "url('@/assets/game/night.png')",
      },
    },
  },
  plugins: [],
};
