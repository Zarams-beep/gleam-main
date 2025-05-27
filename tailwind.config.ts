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
        primary: {
          DEFAULT: "#1A1023", // Deep dark purple
          soft: "#2E1A35",    // Slightly lighter
          surface: "#3B2E4A", // For cards/surfaces
        },
        foreground: {
          DEFAULT: "#EDE9F3", // Off-white lavender
          subtle: "#D6CFE6",  // Muted text
        },
        accent: {
          DEFAULT: "#B794F4", // Elegant soft purple
          hover: "#A076F4",   // Hover states
        },
        highlight: {
          DEFAULT: "#FFD166", // Gleam yellow
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
        },
      },
      screens: {
        base: "320px",
        "1sm": "370px",
        xs: "400px",
        sm: "420px",
        smm: "500px",
        md: "768px",
        mdd: "896px",
        lg: "1024px",
        lgg: "1200px",
        xl: "1340px",
        "2xl": "1560px",
        "3xl": "3560px",
      },
    },
    
  },
  plugins: [],
};

export default config;