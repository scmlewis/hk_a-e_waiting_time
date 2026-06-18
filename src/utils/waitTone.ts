import type { WaitStatus } from '../types/ae'

export function getWaitingTimeTone(waitStatus: WaitStatus, isDark: boolean): string {
  if (isDark) {
    return {
      short: 'text-green-400',
      moderate: 'text-amber-400',
      long: 'text-red-400',
      unknown: 'text-neutral-500',
    }[waitStatus]
  }

  return {
    short: 'text-green-600',
    moderate: 'text-amber-600',
    long: 'text-red-600',
    unknown: 'text-neutral-500',
  }[waitStatus]
}

export function getWaitingTimeBg(waitStatus: WaitStatus, isDark: boolean): string {
  if (isDark) {
    return {
      short: 'bg-green-400/10',
      moderate: 'bg-amber-400/10',
      long: 'bg-red-400/10',
      unknown: 'bg-neutral-500/10',
    }[waitStatus]
  }

  return {
    short: 'bg-green-600/10',
    moderate: 'bg-amber-600/10',
    long: 'bg-red-600/10',
    unknown: 'bg-neutral-500/10',
  }[waitStatus]
}

export function getWaitingTimeBorder(waitStatus: WaitStatus, isDark: boolean): string {
  if (isDark) {
    return {
      short: 'border-green-400',
      moderate: 'border-amber-400',
      long: 'border-red-400',
      unknown: 'border-neutral-500',
    }[waitStatus]
  }

  return {
    short: 'border-green-600',
    moderate: 'border-amber-600',
    long: 'border-red-600',
    unknown: 'border-neutral-500',
  }[waitStatus]
}

export function getWaitingTimeDot(waitStatus: WaitStatus): string {
  return {
    short: 'bg-green-500',
    moderate: 'bg-amber-500',
    long: 'bg-red-500',
    unknown: 'bg-neutral-400',
  }[waitStatus]
}
