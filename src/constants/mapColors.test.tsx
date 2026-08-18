// src/constants/mapColors.test.tsx
import { describe, it, expect } from 'vitest'
import { WAIT_STATUS_COLORS } from './mapColors'

describe('WAIT_STATUS_COLORS', () => {
  it('maps every WaitStatus to a 6-digit hex color', () => {
    expect(WAIT_STATUS_COLORS.short).toMatch(/^#[0-9a-f]{6}$/i)
    expect(WAIT_STATUS_COLORS.moderate).toMatch(/^#[0-9a-f]{6}$/i)
    expect(WAIT_STATUS_COLORS.long).toMatch(/^#[0-9a-f]{6}$/i)
    expect(WAIT_STATUS_COLORS.unknown).toMatch(/^#[0-9a-f]{6}$/i)
  })
})
