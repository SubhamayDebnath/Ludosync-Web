import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0D0F0E",
        surface: "#151916",
        surface2: "#1D221F",
        ink: "#F2F4EC",
        muted: "#969D94",
        primary: "#B8F34A",
        secondary: "#A78BFA",
        accent: "#FFB454",
        danger: "#FF6B6B",
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
