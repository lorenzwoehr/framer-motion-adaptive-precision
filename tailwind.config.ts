import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin"; // Import plugin helper

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      userSelect: {
        none: "none",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".select-none": {
          "-webkit-user-select": "none" /* Safari and Chrome */,
          "-moz-user-select": "none" /* Firefox */,
          "-ms-user-select": "none" /* IE 10+ */,
          "user-select": "none" /* Standard */,
        },
      };

      addUtilities(newUtilities);
    }),
  ],
};

export default config;
