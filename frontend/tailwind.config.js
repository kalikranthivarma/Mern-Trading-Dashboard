export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--bg-base) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--brand-primary) / <alpha-value>)',
          hover: 'rgb(var(--brand-primary-hover) / <alpha-value>)'
        },
        muted: 'rgb(var(--text-muted) / <alpha-value>)',
        border: 'rgb(var(--border-subtle) / <alpha-value>)',
        // Overrides for existing classes to support instant theme switching
        slate: {
          950: 'rgb(var(--bg-base) / <alpha-value>)',
          900: 'rgb(var(--bg-surface) / <alpha-value>)',
          800: 'rgb(var(--bg-elevated) / <alpha-value>)',
          700: 'rgb(var(--border-strong) / <alpha-value>)',
          600: 'rgb(var(--border-subtle) / <alpha-value>)',
          500: 'rgb(var(--text-muted) / <alpha-value>)',
          400: 'rgb(var(--text-secondary) / <alpha-value>)',
          300: 'rgb(var(--text-secondary) / <alpha-value>)',
          100: 'rgb(var(--text-primary) / <alpha-value>)',
          50: 'rgb(var(--text-primary) / <alpha-value>)'
        },
        sky: {
          500: 'rgb(var(--brand-primary) / <alpha-value>)',
          400: 'rgb(var(--brand-primary-hover) / <alpha-value>)'
        },
        white: 'rgb(var(--text-primary) / <alpha-value>)',
        'pure-white': '#ffffff',
        'pure-black': '#000000'
      },
      textColor: {
        primary: 'rgb(var(--text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        muted: 'rgb(var(--text-muted) / <alpha-value>)'
      },
      borderColor: {
        DEFAULT: 'rgb(var(--border-subtle) / <alpha-value>)',
        strong: 'rgb(var(--border-strong) / <alpha-value>)'
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))'
      }
    }
  },
  plugins: []
};
