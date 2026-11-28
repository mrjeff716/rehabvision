/** @type {import('tailwindcss').Config} */
// CommonJS (.cjs) on purpose: Node 22 caches ES-module configs, so a running
// dev server would never see edits to this file without a restart.
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // System fonts only: no web-font request to a third party (privacy),
        // nothing to download. Arabic/Armenian fall back to the OS's own fonts.
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', '"Cascadia Mono"', 'Consolas', 'monospace'],
      },
      colors: {
        ink: '#0F172A',     // text, 17.8:1 on white
        muted: '#475569',   // secondary text, 7.6:1 on white
        rule: '#E2E8F0',    // borders and dividers
        paper: '#F4F6FB',   // page background behind white cards
        // calm, friendly blue (6.7:1 on white)
        accent: {
          DEFAULT: '#1D4ED8',
          hover: '#1E40AF',
          tint: '#EEF3FF',
        },
        danger: { DEFAULT: '#B42318', tint: '#FEF3F2' },  // 6.6:1 on tint
        caution: { DEFAULT: '#7A4D00', tint: '#FFF6E0' }, // 7.4:1 on tint
        success: { DEFAULT: '#067647', tint: '#ECFDF3' }, // 5.6:1 on tint
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 4px 16px rgb(15 23 42 / 0.05)',
        lift: '0 2px 4px rgb(15 23 42 / 0.05), 0 12px 32px rgb(15 23 42 / 0.09)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'alert-in': {
          '0%': { opacity: '0', transform: 'translateX(-6px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        // a number that just changed (rep counter) pops once
        tick: {
          '0%': { transform: 'scale(1.18)', color: '#1D4ED8' },
          '100%': { transform: 'none' },
        },
        // icon swapping in (eye / copy check)
        'icon-in': {
          '0%': { opacity: '0', transform: 'rotate(-90deg) scale(0.6)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'dialog-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        shimmer: {
          '0%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        'rule-draw': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '50%': { transform: 'translateX(3px)' },
          '75%': { transform: 'translateX(-2px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
        'fade-in': 'fade-in 0.25s ease-out backwards',
        'alert-in': 'alert-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
        tick: 'tick 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'icon-in': 'icon-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'dialog-in': 'dialog-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        shimmer: 'shimmer 1.4s linear infinite',
        'rule-draw': 'rule-draw 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
        shake: 'shake 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
