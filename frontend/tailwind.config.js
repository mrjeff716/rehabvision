/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Swiss: square corners everywhere (max 2px), so the scale is replaced, not extended
    borderRadius: {
      none: '0',
      DEFAULT: '2px',
      sm: '2px',
      md: '2px',
      lg: '2px',
      xl: '2px',
      '2xl': '2px',
      full: '9999px',
    },
    extend: {
      fontFamily: {
        // One family, from the device: no web-font request to a third party (privacy),
        // nothing to download. Arabic/Armenian fall back to the OS's own fonts.
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#111111',     // text, 18.9:1 on white
        muted: '#555555',   // secondary text, 7.5:1 on white
        rule: '#E2E2E4',    // 1px lines and borders
        paper: '#F7F7F8',   // alternate surface
        // the ONE accent: Yves Klein Blue (10.7:1 on white)
        accent: {
          DEFAULT: '#002FA7',
          hover: '#00237D',
          tint: '#EEF2FB',
        },
        danger: { DEFAULT: '#B42318', tint: '#FEF3F2' },  // 6.6:1 on tint
        caution: { DEFAULT: '#7A4D00', tint: '#FFF6E0' }, // 7.4:1 on tint
        success: { DEFAULT: '#067647', tint: '#ECFDF3' }, // 5.6:1 on tint
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
          '0%': { transform: 'scale(1.18)', color: '#002FA7' },
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
