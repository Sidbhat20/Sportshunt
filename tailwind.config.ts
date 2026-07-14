import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces — pure white + soft pitch tints
        canvas: '#ffffff',
        canvasAlt: '#f3f8f1',
        surface: '#ffffff',
        surfaceRaised: '#f7faf5',
        chalk: '#fbfdf9',

        // Ink — pitch black with green undertone
        ink: '#0a1410',
        inkSoft: '#162820',
        muted: '#5b6b62',
        mutedSoft: '#94a39a',

        // Lines / dividers
        line: '#e3ecdf',
        lineStrong: '#c9d6c1',

        // Pitch green — primary
        accent: '#15803d',
        accentHover: '#0f6b32',
        accentDeep: '#064e25',
        accentSoft: '#dcfce7',
        accentSofter: '#f0fdf4',

        // Electric lime — high-energy secondary
        lime: '#a3e635',
        limeDeep: '#65a30d',
        limeSoft: '#ecfccb',

        // Pitch — alternative deep green
        pitch: '#064e3b',
        pitchDeep: '#022c22',

        live: '#ef4444',
        success: '#15803d',
        warning: '#f59e0b',
      },
      boxShadow: {
        soft: '0 6px 20px -8px rgba(15, 80, 50, 0.12)',
        card: '0 18px 40px -18px rgba(15, 80, 50, 0.22)',
        ring: '0 0 0 6px rgba(21, 128, 61, 0.12)',
        glow: '0 16px 40px -12px rgba(21, 128, 61, 0.45)',
        glowLime: '0 16px 40px -12px rgba(163, 230, 53, 0.55)',
        bold: '6px 6px 0 0 #0a1410',
        boldGreen: '6px 6px 0 0 #15803d',
        boldLime: '6px 6px 0 0 #a3e635',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        display: [
          'var(--font-anton)',
          'Impact',
          'Haettenschweiler',
          'Arial Narrow Bold',
          'sans-serif',
        ],
      },
      letterSpacing: {
        athletic: '0.02em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.55)' },
          '70%': { boxShadow: '0 0 0 8px rgba(239, 68, 68, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        },
        kick: {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '50%': { transform: 'translateY(-4px) rotate(-2deg)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        marquee: 'marquee 30s linear infinite',
        'marquee-slow': 'marquee 60s linear infinite',
        'marquee-reverse': 'marquee-reverse 40s linear infinite',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
        kick: 'kick 2.4s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
