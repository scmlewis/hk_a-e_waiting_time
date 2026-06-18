import { useEffect, useState } from 'react'
import { Icon } from './Icon'

export type SnackbarType = 'info' | 'error' | 'warning'

interface SnackbarProps {
  message: string
  type: SnackbarType
  visible: boolean
  onDismiss: () => void
}

const typeStyles: Record<SnackbarType, { bg: string; text: string; border: string; icon: string }> = {
  info: {
    bg: 'bg-m3-surface-container-high',
    text: 'text-m3-on-surface',
    border: 'border-m3-outline-variant',
    icon: '',
  },
  error: {
    bg: 'bg-m3-error-container',
    text: 'text-m3-on-error-container',
    border: 'border-m3-error',
    icon: '',
  },
  warning: {
    bg: 'bg-m3-surface-container-high',
    text: 'text-m3-on-surface',
    border: 'border-m3-tertiary',
    icon: '',
  },
}

export function Snackbar({ message, type, visible, onDismiss }: SnackbarProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (visible) {
      setShouldRender(true)
      setAnimating(true)
    } else if (shouldRender) {
      setAnimating(false)
      const timer = setTimeout(() => setShouldRender(false), 150)
      return () => clearTimeout(timer)
    }
  }, [visible, shouldRender])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => onDismiss(), 4000)
    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  if (!shouldRender) return null

  const styles = typeStyles[type]

  return (
    <div
      className={`fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 md:bottom-8`}
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 border px-4 py-3 text-sm font-medium ${styles.bg} ${styles.text} ${styles.border} ${
          animating ? 'snack-enter' : 'snack-exit'
        }`}
        style={{ maxWidth: 560 }}
      >
        {type === 'error' && <Icon name="info" className="h-4 w-4 shrink-0" strokeWidth={2.5} />}
        {type === 'warning' && <Icon name="info" className="h-4 w-4 shrink-0 text-m3-tertiary" strokeWidth={2.5} />}
        <span className="flex-1">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 text-m3-on-surface-variant hover:text-m3-on-surface transition-colors"
          aria-label="Dismiss"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
