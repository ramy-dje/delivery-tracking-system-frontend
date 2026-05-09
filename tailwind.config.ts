import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // Primary brand - Amber
        primary: {
          DEFAULT: "#fbbf24",
          dark: "#f59e0b",
          darker: "#d97706",
          glow: "rgba(251, 191, 36, 0.4)",
          soft: "rgba(251, 191, 36, 0.1)",
        },
        // Secondary - Cyan (sparingly)
        secondary: {
          DEFAULT: "#22d3ee",
          dark: "#06b6d4",
          soft: "rgba(34, 211, 238, 0.08)",
        },
        // Success
        success: {
          DEFAULT: "#34d399",
          soft: "rgba(52, 211, 153, 0.1)",
        },
        // Backgrounds
        background: {
          main: "#030712",
          surface: "#06090f",
          alt: "#0d1117",
          elevated: "#111827",
        },
        // Borders
        border: {
          subtle: "rgba(255, 255, 255, 0.05)",
          default: "rgba(255, 255, 255, 0.1)",
          primary: "rgba(251, 191, 36, 0.25)",
        },
        // Text
        text: {
          primary: "#ffffff",
          secondary: "#94a3b8",
          muted: "#64748b",
          brand: "#fbbf24",
        },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "gradient-primary": "linear-gradient(135deg, #fbbf24, #f59e0b)",
        "gradient-dark": "linear-gradient(135deg, #0f172a, #020617)",
      },
      backgroundSize: {
        grid: "60px 60px",
      },
      animation: {
        ping2: "ping2 2s ease-out infinite",
        blink: "blink 1s step-end infinite",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        ping2: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "75%": { transform: "scale(2)", opacity: "0" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;