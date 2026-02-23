import type { TriageCategory } from '../types/ae'

export const TRIAGE_KEYS: TriageCategory[] = ['I', 'II', 'III', 'IV_V']

export function getTriageCategoryShortLabel(category: TriageCategory): string {
  return category === 'IV_V' ? 'IV & V' : category
}
