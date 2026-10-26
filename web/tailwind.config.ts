import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // identidade Proteção RR (sobrescrita por tenant via white-label depois)
        brand: {
          DEFAULT: "#0d6e3e",
          ink: "#0b5c34",
          light: "#e8f5ee",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
