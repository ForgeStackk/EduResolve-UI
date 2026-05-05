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
        // Primary brand red (used across legacy + HUD)
        brand: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          DEFAULT: '#dc2626',
        },
        // Neutral surfaces - kept for legacy admin/teacher screens.
        surface: {
          base:  '#ffffff',
          dim:   '#f7f7f8',
          low:   '#f3f3f4',
          DEFAULT: '#eeeeef',
          high:  '#e6e6e8',
          ink:   '#0a0a0a',
          mute:  '#525252',
          line:  '#e5e5e5',
          ring:  '#d4d4d4',
        },
        // ---------------------------------------------------------------
        // High-Energy HUD palette (student / learn screens)
        // Mirrors stitch_eduresolve_master_design_spec/high_energy_hud
        // ---------------------------------------------------------------
        hud: {
          bg:                '#1f0f0d',
          'surface':         '#1f0f0d',
          'surface-dim':     '#1f0f0d',
          'surface-bright':  '#493432',
          'container-lowest':'#190a08',
          'container-low':   '#281715',
          'container':       '#2d1b19',
          'container-high':  '#382523',
          'container-highest':'#44302e',
          'on-surface':      '#fbdbd7',
          'on-surface-variant':'#e6bdb8',
          outline:           '#ac8884',
          'outline-variant': '#5c403c',
          primary:           '#ffb4ab',
          'primary-container':'#dc2626',
          'on-primary':      '#690005',
          'on-primary-container':'#fff6f5',
          secondary:         '#c9c6c5',
          tertiary:          '#c6c6c7',
          // subject accents
          physics:  '#3b82f6',
          math:     '#8b5cf6',
          chem:     '#10b981',
          cs:       '#f59e0b',
          english:  '#ec4899',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Lexend', 'Inter', 'system-ui', 'sans-serif'],
        lexend:  ['Lexend', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title-lg':   ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg':    ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md':    ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md':   ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        // HUD scale (per DESIGN.md)
        'hud-h1':     ['44px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'hud-h2':     ['28px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'hud-h3':     ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'hud-body-lg':['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'hud-body':   ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'hud-caps':   ['11px', { lineHeight: '1', letterSpacing: '0.12em', fontWeight: '700' }],
      },
      boxShadow: {
        fab: '0 4px 16px 0 rgb(220 38 38 / 0.16)',
        'hud-glow':       '0 0 20px rgba(220, 38, 38, 0.35)',
        'hud-glow-sm':    '0 0 12px rgba(220, 38, 38, 0.30)',
        'hud-glow-lg':    '0 0 30px rgba(220, 38, 38, 0.45)',
        'hud-card':       '0 0 20px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        hud: '12px',
      },
    },
  },
  plugins: [],
}
