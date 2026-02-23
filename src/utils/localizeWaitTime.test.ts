import { describe, expect, it } from 'vitest'
import { localizeWaitTimeText } from './localizeWaitTime'

describe('localizeWaitTimeText', () => {
  it('keeps english text for en mode', () => {
    expect(localizeWaitTimeText('65 minutes', 'en')).toBe('65 minutes')
  })

  it('translates minute text in zh-HK mode', () => {
    expect(localizeWaitTimeText('65 minutes', 'zh-HK')).toBe('65 分鐘')
  })

  it('translates hour text in zh-HK mode', () => {
    expect(localizeWaitTimeText('9.5 hours', 'zh-HK')).toBe('9.5 小時')
  })

  it('translates less-than phrase in zh-HK mode', () => {
    expect(localizeWaitTimeText('less than 15 minutes', 'zh-HK')).toBe('少於 15 分鐘')
  })

  it('handles missing wait text', () => {
    expect(localizeWaitTimeText('-', 'zh-HK')).toBe('未有資料')
  })

  it('translates resuscitation handling message in zh-HK mode', () => {
    expect(localizeWaitTimeText('Managing multiple resuscitation cases', 'zh-HK')).toBe('多名病人正在搶救中')
    expect(localizeWaitTimeText('Managing multiple resuscitation cases.', 'zh-HK')).toBe('多名病人正在搶救中')
  })
})
