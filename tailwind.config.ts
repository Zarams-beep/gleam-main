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
          DEFAULT: "#1A1023",
          soft: "#2E1A35",
          surface: "#3B2E4A",
        },
        foreground: {
          DEFAULT: "#EDE9F3",
          subtle: "#D6CFE6",
        },
        accent: {
          DEFAULT: "#B794F4",
          hover: "#A076F4",
        },
        highlight: {
          DEFAULT: "#FFD166",
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
        },
      },
      fontFamily: {
        classic: ['"Cormorant Garamond"', "serif"],
        clean: ['"Open Sans"', "sans-serif"],
        divine: ['"EB Garamond"', "serif"],
        scripture: ['"Crimson Pro"', "serif"],
        calligraphy: ['"Great Vibes"', "cursive"],
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

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        bounceY: {
          "0%, 100%": { transform: "translateY(-4%)" },
          "50%": { transform: "translateY(4%)" },
        },
        bounceX: {
          "0%, 100%": { transform: "translateX(-4%)" },
          "50%": { transform: "translateX(4%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        zoomIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeZoom: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(40px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-40px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseFast: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        gradientMove: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },

      animation: {
        float: "float 4s ease-in-out infinite",
        wiggle: "wiggle 0.4s ease-in-out",
        bounceY: "bounceY 1.5s ease-in-out infinite",
        bounceX: "bounceX 1.5s ease-in-out infinite",
        fadeIn: "fadeIn 0.6s ease-in forwards",
        zoomIn: "zoomIn 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)",
        fadeZoom: "fadeZoom 0.8s ease-out forwards",
        slideLeft: "slideLeft 0.6s ease-out",
        slideRight: "slideRight 0.6s ease-out",
        slideUp: "slideUp 0.6s ease-out",
        slideDown: "slideDown 0.6s ease-out",
        pulseFast: "pulseFast 1.2s ease-in-out infinite",
        gradientMove: "gradientMove 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
