import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1116",
        paper: "#FAF7F2",
        bone: "#EDE7DD",
        accent: "#E8554E",
        mute: "#8A8579",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        content: "1120px",
        prose: "720px",
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "6px",
      },
      letterSpacing: {
        tightish: "-0.018em",
      },
    },
  },
  plugins: [],
} satisfies Config;
