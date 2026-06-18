import { useCallback, useEffect, useState } from 'react'

export type LanguageMode = 'en' | 'zh-HK'

const LANGUAGE_STORAGE_KEY = 'ewt_language_mode'

export function useSettings() {
  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    if (typeof window === 'undefined') return 'en'
    const savedValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return savedValue === 'zh-HK' ? 'zh-HK' : 'en'
  })

  const toggleLanguageMode = useCallback(() => {
    setLanguageMode((currentMode) => (currentMode === 'en' ? 'zh-HK' : 'en'))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, languageMode)
    }
  }, [languageMode])

  return {
    languageMode,
    isDark: true,
    toggleLanguageMode,
    setLanguageMode,
  }
}
