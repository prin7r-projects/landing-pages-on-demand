import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Swiss Industrial Print substrate — newsprint off-white, carbon ink.
        // The previous warm palette (paper #FAF7F2 / bone #EDE7DD) is retired.
        ink: "#0A0A0A",
        paper: "#F8F8F6",
        bone: "#ECECE8",
        accent: "#E61919",
        mute: "#5C5C58",
      },
      fontFamily: {
        // Archivo Black is the macro-typography (display headers).
        // Geist is the body sans-serif (Inter is BANNED for this brand).
        // JetBrains Mono is preserved for tabular metadata + telemetry.
        display: ["var(--font-archivo)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        sans: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        content: "1280px",
        prose: "720px",
      },
      borderRadius: {
        none: "0",
        sm: "0",
        DEFAULT: "0",
      },
      letterSpacing: {
        tightish: "-0.018em",
        tighter2: "-0.04em",
        wider2: "0.08em",
      },
    },
  },
  plugins: [],
} satisfies Config;
