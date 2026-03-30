import { useCallback, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'auto'
export type LanguageMode = 'en' | 'zh-HK'

const THEME_STORAGE_KEY = 'ewt_theme_mode'
const LANGUAGE_STORAGE_KEY = 'ewt_language_mode'

export function useSettings() {
  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'auto'
    const savedValue = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (savedValue === 'light' || savedValue === 'dark' || savedValue === 'auto') {
      return savedValue
    }
    return 'auto'
  })

  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    if (typeof window === 'undefined') return 'en'
    const savedValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return savedValue === 'zh-HK' ? 'zh-HK' : 'en'
  })

  const toggleLanguageMode = useCallback(() => {
    setLanguageMode((currentMode) => (currentMode === 'en' ? 'zh-HK' : 'en'))
  }, [])

  const toggleThemeMode = useCallback(() => {
    setThemeMode((currentMode) => {
      if (currentMode === 'auto') {
        return systemPrefersDark ? 'light' : 'dark'
      }
      return currentMode === 'dark' ? 'light' : 'dark'
    })
  }, [systemPrefersDark])

  const resolvedTheme = themeMode === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : themeMode
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    }
  }, [themeMode])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, languageMode)
    }
  }, [languageMode])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches)
    mediaQuery.addEventListener('change', handleThemeChange)
    return () => mediaQuery.removeEventListener('change', handleThemeChange)
  }, [])

  return {
    themeMode,
    languageMode,
    resolvedTheme,
    isDark,
    toggleThemeMode,
    toggleLanguageMode,
    setLanguageMode,
    setThemeMode,
  }
}
