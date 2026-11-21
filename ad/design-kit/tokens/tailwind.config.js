/**
 * Optional Tailwind v3-style theme fragment; not an installed dependency.
 * For other Tailwind versions use the repository's supported configuration.
 * Import tokens.css once. Never duplicate literal palette values here.
 */
export default {
  theme: {
    extend: {
      colors: {
        acadza: {
          ink: 'var(--ac-ink)', paper: 'var(--ac-bg)', surface: 'var(--ac-surface)',
          muted: 'var(--ac-muted)', navy: 'var(--ac-navy)', primary: 'var(--ac-primary)',
          'primary-hover': 'var(--ac-primary-hover)', selected: 'var(--ac-primary-soft)',
          accent: 'var(--ac-accent)', border: 'var(--ac-border)',
          danger: 'var(--ac-danger)', success: 'var(--ac-success)', attention: 'var(--ac-attention)',
        },
      },
      borderRadius: { 'ac-sm': 'var(--ac-radius-sm)', ac: 'var(--ac-radius-md)', 'ac-lg': 'var(--ac-radius-lg)' },
      fontFamily: { sans: ['var(--ac-font-body)'] },
    },
  },
};
