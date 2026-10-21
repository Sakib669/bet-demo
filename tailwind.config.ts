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
        background: "#081329",
        surface: {
          DEFAULT: "#0e1f3d",
          dark: "#060d1c",
          card: "rgba(25, 62, 135, 0.28)",
          hover: "rgba(45, 132, 249, 0.2)",
        },
        header: "#193e87",
        palette: {
          navy: "#193e87",
          cobalt: "#2d84f9",
          sky: "#94caf9",
          orange: "#fc7219",
          peach: "#fedbbb",
        },
        brand: {
          navy: "#193e87",
          blue: "#193e87",
          lightBlue: "#2d84f9",
          cobalt: "#2d84f9",
          sky: "#94caf9",
          orange: "#fc7219",
          orangeHover: "#e56412",
          gold: "#fedbbb",
          peach: "#fedbbb",
          cyan: "#94caf9",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#94caf9",
          muted: "#668ab8",
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
