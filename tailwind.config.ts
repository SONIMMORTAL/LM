import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brooklyn Noir Palette - Overriding defaults
        background: "#050505",
        foreground: "#F5F5F5",
        noir: {
          void: "#050505",      // Deep black
          charcoal: "#1A1A1A",  // Primary surface
          slate: "#2A2A2A",     // Elevated surface
          smoke: "#3A3A3A",     // Borders/dividers
          ash: "#6A6A6A",       // Muted text
          cloud: "#A0A0A0",     // Secondary text
        },
        accent: {
          cyan: "#00D9FF",      // High-voltage cyan
          cyanMuted: "#00B8D9", // Hover state
          cyanGlow: "rgba(0, 217, 255, 0.4)", // Glow effects
        },
        // Override gray with our charcoal palette
        gray: {
          50: "#F5F5F5",
          100: "#E0E0E0",
          200: "#A0A0A0",
          300: "#6A6A6A",
          400: "#4A4A4A",
          500: "#3A3A3A",
          600: "#2A2A2A",
          700: "#1A1A1A",
          800: "#0F0F0F",
          900: "#050505",
          950: "#000000",
        },
      },
      fontFamily: {
        display: ["var(--font-druk)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        editorial: ["var(--font-editorial)", "Georgia", "serif"],
      },
      animation: {
        "grain": "grain 8s steps(10) infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "expand": "expand 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "collapse": "collapse 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "20%": { transform: "translate(-15%, 5%)" },
          "30%": { transform: "translate(7%, -25%)" },
          "40%": { transform: "translate(-5%, 25%)" },
          "50%": { transform: "translate(-15%, 10%)" },
          "60%": { transform: "translate(15%, 0%)" },
          "70%": { transform: "translate(0%, 15%)" },
          "80%": { transform: "translate(3%, 35%)" },
          "90%": { transform: "translate(-10%, 10%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        expand: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        collapse: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(0, 217, 255, 0.2)",
        "glow-md": "0 0 20px rgba(0, 217, 255, 0.3)",
        "glow-lg": "0 0 40px rgba(0, 217, 255, 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
