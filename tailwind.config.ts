import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Meta Store Design System
        ink: '#1C2B33',          // Dark Charcoal — headings
        muted: '#5D6C7B',        // Slate Gray — body text / secondary
        line: '#DEE3E9',         // Divider Gray
        surface: '#FFFFFF',
        subtle: '#F1F4F7',       // Soft Gray — secondary surface
        'near-black': '#1C1E21', // Dark section backgrounds
        primary: {
          DEFAULT: '#0064E0',    // Meta Blue — primary CTA
          hover: '#0143B5',      // Meta Blue Hover
          pressed: '#004BB9',    // Meta Blue Pressed
          light: '#E8F3FF',      // Baby Blue — badge/chip bg
          dark: '#0143B5',
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
