import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d6edff",
          200: "#aeddff",
          300: "#7ec9ff",
          400: "#4bb1ff",
          500: "#1f96ff",   // primary (blue-ish)
          600: "#0b78db",
          700: "#085eac",
          800: "#084f8d",
          900: "#0a416f"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
