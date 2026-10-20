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
        background: "#040F26",
        surface: {
          DEFAULT: "#051738",
          dark: "#030B1C",
          card: "rgba(13, 44, 92, 0.75)",
          hover: "rgba(18, 58, 120, 0.85)",
        },
        header: "#08478E",
        brand: {
          blue: "#08478E",
          lightBlue: "#0B5CB8",
          orange: "#FF6B00",
          orangeHover: "#FF5500",
          gold: "#FFC700",
          cyan: "#00D2FF",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#8EA8C7",
          muted: "#5B7596",
        },
        ruby: {
          DEFAULT: "#EF4444",
          glow: "rgba(239, 68, 68, 0.3)",
        },
        emerald: {
          DEFAULT: "#10B981",
          glow: "rgba(16, 185, 129, 0.3)",
        },
      },
      boxShadow: {
        'orange-glow': '0 0 25px rgba(255, 107, 0, 0.45)',
        'blue-glow': '0 0 30px rgba(8, 71, 142, 0.5)',
        'gold-glow': '0 0 20px rgba(255, 199, 0, 0.35)',
        'card': '0 12px 32px -8px rgba(0, 0, 0, 0.65), 0 4px 12px -2px rgba(8, 71, 142, 0.15)',
      },
      fontFamily: {
        sans: [
          '"Roboto"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Arial',
          'sans-serif',
        ],
        display: [
          '"Roboto Condensed"',
          '"Roboto"',
          'sans-serif',
        ],
        mono: [
          '"Roboto Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
export default config;
