/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          bg: "#0B0D0C",
          "bg-secondary": "#12141A",
          surface: "rgba(255, 255, 255, 0.04)",
          "surface-hover": "rgba(255, 255, 255, 0.08)",
          "surface-active": "rgba(255, 255, 255, 0.12)",
          border: "rgba(255, 255, 255, 0.10)",
          "border-highlight": "rgba(255, 255, 255, 0.20)",
          amber: "#E4A94A",
          "amber-hover": "#F2B84D",
          green: "#7CFFB2",
          red: "#FF5C5C",
          cyan: "#38BDF8",
          text: "#E8EAED",
          muted: "#9BA1A6",
        },
      },
      fontFamily: {
        sans: ["Inter", "Sora", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "Consolas", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        "amber-glow": "0 0 20px -2px rgba(228, 169, 74, 0.4)",
        "green-glow": "0 0 20px -2px rgba(124, 255, 178, 0.4)",
        "red-glow": "0 0 20px -2px rgba(255, 92, 92, 0.4)",
      },
    },
  },
  plugins: [],
}
