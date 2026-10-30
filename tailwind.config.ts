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
        background: "#0c1714",
        surface: {
          DEFAULT: "#182b21",
          dark: "#060d1c",
          card: "rgba(25, 62, 135, 0.28)",
          hover: "rgba(45, 132, 249, 0.2)",
        },
        header: "#345441",
        palette: {
          navy: "#345441",
          cobalt: "#c4e77d",
          sky: "#aabdab",
          orange: "#c4e77d",
          peach: "#e2f4c6",
        },
        brand: {
          navy: "#345441",
          blue: "#345441",
          lightBlue: "#c4e77d",
          cobalt: "#c4e77d",
          sky: "#aabdab",
          orange: "#c4e77d",
          orangeHover: "#a8ce62",
          gold: "#e2f4c6",
          peach: "#e2f4c6",
          cyan: "#aabdab",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#aabdab",
          muted: "#849c89",
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
        'orange-glow': '0 0 25px rgba(252, 114, 25, 0.5)',
        'blue-glow': '0 0 30px rgba(45, 132, 249, 0.5)',
        'cobalt-glow': '0 0 25px rgba(45, 132, 249, 0.45)',
        'peach-glow': '0 0 20px rgba(254, 219, 187, 0.35)',
        'gold-glow': '0 0 20px rgba(254, 219, 187, 0.35)',
        'card': '0 12px 32px -8px rgba(0, 0, 0, 0.65), 0 4px 14px -2px rgba(25, 62, 135, 0.35)',
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
