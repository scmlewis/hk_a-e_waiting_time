import type { WaitStatus } from '../types/ae'

export function getWaitingTimeTone(waitStatus: WaitStatus, isDark: boolean): string {
  if (isDark) {
    return {
      short: 'text-emerald-300',
      moderate: 'text-amber-300',
      long: 'text-rose-300',
      unknown: 'text-slate-300',
    }[waitStatus]
  }

  return {
    short: 'text-emerald-700',
    moderate: 'text-amber-700',
    long: 'text-rose-700',
    unknown: 'text-slate-700',
  }[waitStatus]
}
