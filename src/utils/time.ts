export function formatCountdown(seconds: number): string {
  const clamped = Math.max(seconds, 0)
  const minutes = Math.floor(clamped / 60)
  const remainingSeconds = clamped % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
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
