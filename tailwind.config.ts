import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Medical Design System — Teal/Cyan palette
        ink: '#134E4A',          // Teal-900 — headings
        muted: '#5D6C7B',        // Slate Gray — body text / secondary
        line: '#CCFBF1',         // Teal-100 — divider
        surface: '#FFFFFF',
        subtle: '#F0FDFA',       // Teal-50 — secondary surface
        'near-black': '#0F2E2B', // Deep teal — dark section backgrounds
        primary: {
          DEFAULT: '#0891B2',    // Cyan-600 — primary CTA
          hover: '#0E7490',      // Cyan-700 — hover
          pressed: '#155E75',    // Cyan-800 — pressed
          light: '#ECFEFF',      // Cyan-50 — badge/chip bg
          dark: '#0E7490',
        },
        success: {
          DEFAULT: '#007D1E',
          light: '#dcfce7',
        },
        warning: {
          DEFAULT: '#b45309',
          light: '#fef3c7',
        },
        danger: {
          DEFAULT: '#C80A28',
          light: '#fee2e2',
        },
      },
      boxShadow: {
        // Level 1 — subtle lift
        card: '0 2px 4px 0 rgba(0,0,0,0.10)',
        // Level 2 — elevated cards, modals
        floating: '0 12px 28px 0 rgba(0,0,0,0.20), 0 2px 4px 0 rgba(0,0,0,0.10)',
        // Outline ring
        ring: '0 0 0 1px #DEE3E9',
      },
      fontFamily: {
        sans: ['Sarabun', 'TH Sarabun New', 'THSarabunNew', 'Arial', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        pill: '100px',
      },
      maxWidth: {
        shell: '1440px',
      },
    },
  },
  plugins: [forms],
} satisfies Config;
