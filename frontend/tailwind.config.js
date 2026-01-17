/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Catppuccin Mocha Colors
      colors: {
        // Base colors
        rosewater: 'var(--rosewater)',
        flamingo: 'var(--flamingo)',
        pink: 'var(--pink)',
        mauve: 'var(--mauve)',
        red: 'var(--red)',
        maroon: 'var(--maroon)',
        peach: 'var(--peach)',
        yellow: 'var(--yellow)',
        green: 'var(--green)',
        teal: 'var(--teal)',
        sky: 'var(--sky)',
        sapphire: 'var(--sapphire)',
        blue: 'var(--blue)',
        lavender: 'var(--lavender)',

        // Text
        text: 'var(--text)',
        subtext: 'var(--subtext-0)',
        'subtext-1': 'var(--subtext-1)',

        // Overlay
        'overlay-0': 'var(--overlay-0)',
        'overlay-1': 'var(--overlay-1)',
        'overlay-2': 'var(--overlay-2)',

        // Surface
        'surface-0': 'var(--surface-0)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',

        // Background
        base: 'var(--base)',
        mantle: 'var(--mantle)',
        crust: 'var(--crust)',

        // Semantic
        accent: 'var(--accent)',
        focus: 'var(--focus)',
      },

      // Custom spacing for Hyprland gaps
      spacing: {
        'gap-in': 'var(--window-gap-in)',
        'gap-out': 'var(--window-gap-out)',
      },

      // Border radius
      borderRadius: {
        window: 'var(--window-rounding)',
      },

      // Fonts
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // Animations
      keyframes: {
        // Jelly shake effect (preserved from original)
        jelly: {
          '0%, 100%': { transform: 'scale(1, 1)' },
          '25%': { transform: 'scale(0.95, 1.05)' },
          '50%': { transform: 'scale(1.05, 0.95)' },
          '75%': { transform: 'scale(0.98, 1.02)' },
        },

        // Fade in
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },

        // Slide up
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },

        // Slide down
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },

        // Scale in (for windows)
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },

        // Pulse glow
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(203, 166, 247, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(203, 166, 247, 0.4)' },
        },

        // Gradient border
        gradientBorder: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },

        // Spin slow
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        jelly: 'jelly 0.5s ease-in-out',
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.2s ease-out',
        slideDown: 'slideDown 0.2s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        gradientBorder: 'gradientBorder 4s ease infinite',
        spinSlow: 'spinSlow 3s linear infinite',
      },

      // Backdrop blur
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
      },

      // Box shadow
      boxShadow: {
        window: '0 8px 32px rgba(17, 17, 27, 0.5)',
        'window-active':
          '0 0 0 2px var(--accent), 0 8px 32px rgba(17, 17, 27, 0.5), 0 0 30px rgba(203, 166, 247, 0.2)',
        glow: '0 0 20px rgba(203, 166, 247, 0.4)',
        'glow-blue': '0 0 20px rgba(137, 180, 250, 0.4)',
        'glow-green': '0 0 20px rgba(166, 227, 161, 0.4)',
        'glow-red': '0 0 20px rgba(243, 139, 168, 0.4)',
      },

      // Transition timing functions (Hyprland bezier curves)
      transitionTimingFunction: {
        hypr: 'cubic-bezier(0.05, 0.9, 0.1, 1.05)',
        smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
        snappy: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      },

      // Z-index layers
      zIndex: {
        desktop: '0',
        windows: '10',
        bar: '50',
        overlay: '100',
        launcher: '200',
        powermenu: '300',
        notification: '9999',
      },
    },
  },
  plugins: [],
};
