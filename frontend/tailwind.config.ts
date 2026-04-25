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
          bg:          "#F5F7F7",
          surface:     "#FFFFFF",
          primary:     "#1A2730",
          accent:      "#1E7B7B",
          accentLight: "#E6F4F4",
          accentMid:   "#6BB8B8",
          accentDeep:  "#145858",
          good:        "#2E7D52",
          goodLight:   "#E9F5EE",
          warn:        "#B5620E",
          warnLight:   "#FEF0E3",
          bad:         "#BC2B2B",
          badLight:    "#FDECEA",
          border:      "#DDE4E8",
        },
        txt: {
          primary:   "#1A2730",
          secondary: "#637280",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      borderRadius: {
        card:  "16px",
        input: "8px",
        badge: "99px",
      },
      boxShadow: {
        card: "0 4px 28px rgba(30,123,123,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
