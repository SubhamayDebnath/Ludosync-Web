import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0D0F0E",
        surface: "#151916",
        surface2: "#1D221F",
        surface3: "#262D28",
        ink: "#F2F4EC",
        muted: "#969D94",
        primary: "#B8F34A",
        secondary: "#A78BFA",
        accent: "#FFB454",
        danger: "#FF6B6B",
        // Vivid, gem-like board colors — deliberately more saturated than the UI chrome
        // tokens above so the board itself feels playful against the calmer dark shell.
        board: {
          red: "#FF4D5E",
          redDark: "#B8222F",
          green: "#22C55E",
          greenDark: "#0F7A3B",
          yellow: "#FFD53E",
          yellowDark: "#D69C00",
          blue: "#3FA9F5",
          blueDark: "#1667B5",
          cell: "#242B26",
          cellAlt: "#1B211D",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["Gilroy", "Sora", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        app: "42rem",
      },
    },
  },
  plugins: [],
};

export default config;
