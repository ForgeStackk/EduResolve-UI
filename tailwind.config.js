/** @type {import('tailwindcss').Config}
 *
 * Design system: "Lumina" — Indigo / White / Light
 * Calm, focused learning platform for rural Indian students.
 * Role accents: student=indigo, teacher=teal, admin=violet, parent=emerald
 */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — indigo
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          DEFAULT: '#6366f1',
          soft: '#eef2ff',
        },

        // Semantic ink (text) scale
        ink: {
          900: '#0F172A',
          700: '#334155',
          500: '#64748B',
          300: '#CBD5E1',
        },

        // Light surface scale
        surface: {
          DEFAULT: '#FFFFFF',
          base:    '#F7F8FC',
          2:       '#F1F3F9',
          dim:     '#F1F3F9',
          low:     '#E5E9F2',
          line:    '#E5E9F2',
          ring:    '#CBD5E1',
          ink:     '#0F172A',
          mute:    '#64748B',
        },

        // Semantic status colors — color carries MEANING only
        accent:         '#22C55E',
        'accent-soft':  '#E8F8EE',
        warn:           '#F59E0B',
        'warn-soft':    '#FEF6E7',
        danger:         '#EF4444',
        'danger-soft':  '#FEF2F2',

        // Role accent palette — used only for active nav indicator + role badge
        role: {
          student: '#6366F1',
          teacher: '#0D9488',
          admin:   '#7C3AED',
          parent:  '#16A34A',
        },

        // AI / tutor dark panel — the ONE allowed dark surface
        ai: {
          bg:    '#0F172A',
          panel: '#1E293B',
          card:  '#263347',
          text:  '#E2E8F0',
          muted: '#94A3B8',
          brand: '#818cf8',
        },

        // Subject accent colors — used only in subject badges / icons
        subject: {
          physics: '#3b82f6',
          math:    '#8b5cf6',
          chem:    '#10b981',
          cs:      '#f59e0b',
          english: '#ec4899',
          bio:     '#22c55e',
          history: '#f97316',
          geo:     '#06b6d4',
        },

        // Legacy alias so existing templates using `hud.*` colors don't break
        hud: {
          physics: '#3b82f6',
          math:    '#8b5cf6',
          chem:    '#10b981',
          cs:      '#f59e0b',
          english: '#ec4899',
        },
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        none:    '0',
        sm:      '10px',
        DEFAULT: '10px',
        md:      '14px',
        lg:      '20px',
        xl:      '28px',
        '2xl':   '36px',
        full:    '9999px',
      },

      fontSize: {
        'display-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title-lg':   ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title-md':   ['16px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg':    ['16px', { lineHeight: '26px', fontWeight: '400' }],
        'body-md':    ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'label-md':   ['12px', { lineHeight: '16px', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-sm':   ['11px', { lineHeight: '14px', letterSpacing: '0.02em', fontWeight: '500' }],
        // Legacy aliases (templates still use these class names)
        'hud-h1':     ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'hud-h2':     ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'hud-h3':     ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'hud-body-lg':['16px', { lineHeight: '26px', fontWeight: '400' }],
        'hud-body':   ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'hud-caps':   ['11px', { lineHeight: '16px', letterSpacing: '0.04em', fontWeight: '600' }],
      },

      boxShadow: {
        sm:      '0 1px 3px rgba(15, 23, 42, 0.06)',
        DEFAULT: '0 4px 12px rgba(15, 23, 42, 0.06)',
        md:      '0 4px 12px rgba(15, 23, 42, 0.06)',
        lg:      '0 12px 32px rgba(15, 23, 42, 0.08)',
        xl:      '0 20px 48px rgba(15, 23, 42, 0.10)',
        brand:   '0 4px 14px rgba(99, 102, 241, 0.22)',
        inner:   'inset 0 1px 3px rgba(15, 23, 42, 0.06)',
        // Legacy aliases — mapped to soft shadows (no neon)
        fab:           '0 4px 12px rgba(15, 23, 42, 0.12)',
        'hud-glow':    '0 4px 12px rgba(15, 23, 42, 0.08)',
        'hud-glow-sm': '0 2px 8px rgba(15, 23, 42, 0.06)',
        'hud-glow-lg': '0 8px 24px rgba(15, 23, 42, 0.10)',
        'hud-card':    '0 4px 12px rgba(15, 23, 42, 0.06)',
      },

      backdropBlur: {
        hud: '12px',
      },
    },
  },
  plugins: [],
}
