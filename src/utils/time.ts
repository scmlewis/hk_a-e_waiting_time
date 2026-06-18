export function formatCountdown(seconds: number): string {
  const clamped = Math.max(seconds, 0)
  const minutes = Math.floor(clamped / 60)
  const remainingSeconds = clamped % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function formatRelativeTime(sourceUpdateTime: string, locale: 'en' | 'zh-HK' = 'en'): string {
  const normalized = sourceUpdateTime.trim()
  if (!normalized) return ''

  const parsed = Date.parse(normalized)
  if (Number.isNaN(parsed)) return ''

  const diffMs = Date.now() - parsed
  if (diffMs < 0) return ''

  const diffSeconds = Math.floor(diffMs / 1000)
  if (diffSeconds < 60) return locale === 'zh-HK' ? '剛剛更新' : 'Updated just now'

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) {
    return locale === 'zh-HK' ? `更新於 ${diffMinutes} 分鐘前` : `Updated ${diffMinutes} min ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return locale === 'zh-HK' ? `更新於 ${diffHours} 小時前` : `Updated ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return locale === 'zh-HK' ? `更新於 ${diffDays} 天前` : `Updated ${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

export function isSourceDataStale(
  sourceUpdateTime: string,
  staleAfterMinutes = 30,
  nowTimestamp = Date.now(),
): boolean {
  const normalized = sourceUpdateTime.trim()
  if (!normalized) {
    return false
  }

  const parsedTimestamp = Date.parse(normalized)
  if (Number.isNaN(parsedTimestamp)) {
    return false
  }

  const ageMs = nowTimestamp - parsedTimestamp
  if (ageMs < 0) {
    return false
  }

  return ageMs > staleAfterMinutes * 60_000
}
