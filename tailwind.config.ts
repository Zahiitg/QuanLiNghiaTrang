import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          blue: {
            50: "#f0f7ff",
            100: "#e0effe",
            200: "#bae0fd",
            300: "#93c5fd",
            400: "#7ba4d5",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
          },
          slate: {
            subtle: "#F8FAFC",
            border: "#E2E8F0",
            textMain: "#1E293B",
            textMuted: "#475569",
          },
          badge: {
            maitangBg: "#E0E7FF",
            maitangText: "#3730A3",
            mochoBg: "#FEF3C7",
            mochoText: "#92400E",
            trongBg: "#D1FAE5",
            trongText: "#065F46",
          }
        },
      },
    },
  },
  plugins: [],
};

export default config;
