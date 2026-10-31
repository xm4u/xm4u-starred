import type { Filters } from '@/lib/types'
import { serializeFilters } from '@/lib/filter-url'

export type HistoryMethod = 'pushState' | 'replaceState'

/**
 * One history entry per continuous filtering session:
 * the first change is navigable; subsequent edits update that same entry.
 * A browser navigation (Back/Forward or hash navigation) starts a new session.
 */
export function createFilterHistoryController() {
  let hasCreatedEntry = false

  return {
    commit(
      filters: Filters,
      currentHref: string,
      write: (method: HistoryMethod, nextUrl: string) => void,
    ): boolean {
      const current = new URL(currentHref, 'https://example.invalid')
      const currentPath = `${current.pathname}${current.search}${current.hash}`
      const nextUrl = serializeFilters(filters, currentHref)

      if (nextUrl === currentPath) return false

      write(hasCreatedEntry ? 'replaceState' : 'pushState', nextUrl)
      hasCreatedEntry = true
      return true
    },
    reset(): void {
      hasCreatedEntry = false
    },
  }
}
