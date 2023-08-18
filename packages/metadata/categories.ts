import type { VueUseFunction } from '@vueuse/metadata'

export function getCategories(functions: VueUseFunction[]): string[] {
  return Array.from(new Set(functions.reduce<string[]>((acc, cur) => {
    return (!cur.internal && cur.category) ? acc.concat(cur.category) : acc
  }, []))).sort((a, b) => {
    return (a.startsWith('@') && !b.startsWith('@'))
      ? 1
      : (b.startsWith('@') && !a.startsWith('@'))
          ? -1
          : a.localeCompare(b)
  })
}
