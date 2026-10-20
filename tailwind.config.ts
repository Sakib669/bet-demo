import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060814",
        foreground: "#FFFFFF",
        card: {
          DEFAULT: "rgba(15, 23, 42, 0.75)",
          border: "#1E293B",
        },
        cobalt: {
          DEFAULT: "#0000F2",
          light: "#3B82F6",
          dark: "#000099",
          glow: "rgba(0, 0, 242, 0.35)",
        },
        cyan: {
          DEFAULT: "#00D2FF",
          glow: "rgba(0, 210, 255, 0.25)",
        },
        gold: {
          DEFAULT: "#F59E0B",
          glow: "rgba(245, 158, 11, 0.3)",
        },
        emerald: {
          DEFAULT: "#10B981",
          glow: "rgba(16, 185, 129, 0.3)",
        },
        ruby: {
          DEFAULT: "#EF4444",
          glow: "rgba(239, 68, 68, 0.3)",
        },
      },
      boxShadow: {
        'cobalt-glow': '0 0 25px rgba(0, 0, 242, 0.45)',
        'cyan-glow': '0 0 20px rgba(0, 210, 255, 0.35)',
        'inner-glow': 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
