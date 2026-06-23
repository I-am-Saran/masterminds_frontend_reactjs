const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        /* Theme-aware via CSS variables (see src/styles/themes.css) */
        primary: 'rgb(var(--kz-primary-rgb) / <alpha-value>)',
        secondary: 'rgb(var(--kz-accent-rgb) / <alpha-value>)',
        accent: 'rgb(var(--kz-accent-rgb) / <alpha-value>)',
        gold: 'rgb(var(--kz-highlight-rgb) / <alpha-value>)',
        copper: 'rgb(var(--kz-text-rgb) / <alpha-value>)',
        background: 'var(--kz-bg)',
        card: 'var(--kz-surface)',
        text: 'rgb(var(--kz-text-rgb) / <alpha-value>)',
        primaryHover: 'var(--kz-primary-hover)',
        'accent-vibrant': 'var(--kz-accent-vibrant)',
        'accent-muted': 'var(--kz-accent-muted)',
        'surface-dark': 'var(--kz-surface-dark)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
    }
  },
  plugins: []
});