// src/constants/mapColors.ts
import type { WaitStatus } from '../types/ae'

// Raw hex (not Tailwind classes) because SVG fill attributes require literal colors.
// Values mirror the legend dots in AppHeader (green-500 / amber-500 / red-500 / m3-outline),
// which are theme-stable across light and dark mode.
export const WAIT_STATUS_COLORS: Record<WaitStatus, string> = {
  short: '#22c55e',
  moderate: '#f59e0b',
  long: '#ef4444',
  unknown: '#79747e',
}
