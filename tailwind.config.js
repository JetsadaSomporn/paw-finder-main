/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FFF5F5",
        foreground: "hsl(var(--foreground))",
        primary: "#F4A261",
        secondary: "#FEEEEE",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: "#FFFFFF",
        textPrimary: "#1A1A1A",
        textSecondary: "#6B6B6B",
        highlight: "#FFD1DC",
        buttonText: "#FFFFFF",
        inputBorder: "#E0E0E0",
        placeholder: "#BDBDBD",
      },
      fontFamily: {
        rounded: [
          '"Nunito Rounded"',
          '"Quicksand"',
          '"Segoe UI Rounded"',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        lg: "20px",
        md: "12px",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.05)",
      },
      spacing: {
        sm: "8px",
        md: "16px",
        lg: "24px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}