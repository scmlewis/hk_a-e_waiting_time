type LanguageMode = 'en' | 'zh-HK'

const MISSING_WAIT_TOKENS = new Set(['', '-', 'n/a', 'na'])

export function localizeWaitTimeText(waitingTimeText: string, languageMode: LanguageMode): string {
  if (languageMode === 'en') {
    return waitingTimeText
  }

  const original = waitingTimeText.trim()
  if (/[\u3400-\u9FFF]/.test(original)) {
    return original
  }

  const normalized = original.toLowerCase()
  if (MISSING_WAIT_TOKENS.has(normalized)) {
    return '未有資料'
  }

  if (/^managing multiple resuscitation cases\.?$/i.test(original)) {
    return '多名病人正在搶救中'
  }

  const lessThanHour = normalized.match(/^less than\s+(\d+(?:\.\d+)?)\s*hours?$/)
  if (lessThanHour) {
    return `少於 ${lessThanHour[1]} 小時`
  }

  const lessThanMinute = normalized.match(/^less than\s+(\d+)\s*minutes?$/)
  if (lessThanMinute) {
    return `少於 ${lessThanMinute[1]} 分鐘`
  }

  const overHour = normalized.match(/^over\s+(\d+(?:\.\d+)?)\s*hours?$/)
  if (overHour) {
    return `超過 ${overHour[1]} 小時`
  }

  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*hours?/)?.[1]
  const minuteMatch = normalized.match(/(\d+)\s*minutes?/)?.[1]

  if (hourMatch && minuteMatch) {
    return `${hourMatch} 小時 ${minuteMatch} 分鐘`
  }

  if (hourMatch) {
    return `${hourMatch} 小時`
  }

  if (minuteMatch) {
    return `${minuteMatch} 分鐘`
  }

  return original
}
