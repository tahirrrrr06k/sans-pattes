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
        nature: {
          50: '#F2F9F3',
          100: '#E2F3E5',
          200: '#C2E5C8',
          300: '#94CF9E',
          400: '#5FB26E',
          500: '#389348',
          600: '#2E7D32', // Main primary green
          700: '#225E27',
          800: '#1B4A21',
          900: '#143819',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF6EF',
          200: '#F4ECE0',
          300: '#EADBC7',
          400: '#DEC4A7',
        },
        warmgray: {
          50: '#F8F8F7',
          100: '#EFEFEA',
          200: '#DFDFD7',
          500: '#75756C',
          800: '#33332D',
          900: '#1C1C18',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
