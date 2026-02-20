/**
 * App color tokens — single source of truth.
 *
 * Tailwind utility classes are registered via @theme in index.css
 * using the same values (e.g. bg-brand-primary, text-status-active).
 *
 * Import from here when you need hex values in JS/TS
 * (e.g. AntD :value-style, echarts config, ConfigProvider theme).
 */

export const colors = {
  brand: {
    primary: '#3b82f6',
    gradientFrom: '#7c3aed',
    gradientTo: '#2563eb',
  },

  sidebar: '#0a1628',

  status: {
    active: '#22c55e',
    idle: '#f59e0b',
    offline: '#ef4444',
    inactive: '#9ca3af',
  },

  severity: {
    info: { fg: '#3b82f6', bg: '#eff6ff' },
    warning: { fg: '#f59e0b', bg: '#fffbeb' },
    critical: { fg: '#ef4444', bg: '#fef2f2' },
    positive: { fg: '#22c55e', bg: '#f0fdf4' },
  },

  accent: {
    violet: { fg: '#8b5cf6', bg: '#f5f3ff' },
  },

  muted: '#d1d5db',
} as const
