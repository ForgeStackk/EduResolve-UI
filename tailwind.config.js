/** @type {import('tailwindcss').Config}
 *
 *  Design system: "Academic Excellence" mapped to a red / black / white palette.
 *  Tonal layering with 1px borders (no heavy shadows) - see styles.css for the
 *  CSS variables that mirror these tokens.
 */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand red (replaces Oxford Blue from the spec)
        brand: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // primary
          700: '#b91c1c', // primary-strong (headings, FAB)
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          DEFAULT: '#dc2626',
        },
        // Neutral surfaces (cool off-white / soft greys / true black)
        surface: {
          base:  '#ffffff',
          dim:   '#f7f7f8',
          low:   '#f3f3f4',
          DEFAULT: '#eeeeef',
          high:  '#e6e6e8',
          ink:   '#0a0a0a', // primary text
          mute:  '#525252', // secondary text
          line:  '#e5e5e5', // 1px borders
          ring:  '#d4d4d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        // Academic-soft: small radius on inputs/buttons, larger on cards
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      fontSize: {
        // Mirrors DESIGN.md typography scale
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title-lg':   ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg':    ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md':    ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md':   ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      boxShadow: {
        // Only one elevation - reserved for FABs / floating CTAs.
        fab: '0 4px 16px 0 rgb(220 38 38 / 0.16)',
      },
    },
  },
  plugins: [],
}
