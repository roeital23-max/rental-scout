import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#00E5A0",
          orange: "#FFA040",
          red: "#FF5252",
          navy: "#0A0E1A",
          surface: "#0D1421",
        },
        txt: {
          primary: "#E8EDF5",
          secondary: "#8899AA",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      borderRadius: {
        card: "12px",
        input: "8px",
        badge: "99px",
      },
    },
  },
  plugins: [],
};

export default config;
