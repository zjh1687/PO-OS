import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        muted: "#667085",
        line: "#e4e7ec",
        primary: "#2457d6",
        "primary-dark": "#173fa6",
        "soft-primary": "#e8efff",
      },
      boxShadow: {
        panel: "0 18px 45px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
