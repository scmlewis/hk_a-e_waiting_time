import { describe, it, expect } from 'vitest'
import { getLabels } from './labels'

describe('labels', () => {
  it('exposes viewMap in both languages', () => {
    expect(getLabels('en').viewMap).toBe('Map')
    expect(getLabels('zh-HK').viewMap).toBe('地圖')
  })
})
