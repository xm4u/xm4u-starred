import { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_FILTERS, type Filters } from '@/lib/types'

import { readFiltersFromSearch } from '@/lib/filter-url'
import { createFilterHistoryController } from '@/lib/filter-history'

function readFilters(): Filters {
  if (typeof window === 'undefined') return DEFAULT_FILTERS
  return readFiltersFromSearch(window.location.search)
}

export function useFilters() {
  const [filters, setFiltersState] = useState<Filters>(readFilters)
  const filtersRef = useRef(filters)
  const [historySession] = useState(createFilterHistoryController)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    const onPopState = () => {
      historySession.reset()
      const next = readFilters()
      filtersRef.current = next
      setFiltersState(next)
    }
    const onHashChange = () => historySession.reset()
    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [historySession])

  const commit = useCallback((next: Filters) => {
    historySession.commit(next, window.location.href, (method, nextUrl) => {
      window.history[method](window.history.state, '', nextUrl)
    })
    filtersRef.current = next
    setFiltersState(next)
  }, [historySession])

  const setFilters = useCallback(
    (patch: Partial<Filters> | ((previous: Filters) => Filters)) => {
      const previous = filtersRef.current
      const next = typeof patch === 'function' ? patch(previous) : { ...previous, ...patch }
      commit(next)
    },
    [commit],
  )

  const clearFilters = useCallback(() => {
    const previous = filtersRef.current
    commit({ ...DEFAULT_FILTERS, sort: previous.sort, group: previous.group })
  }, [commit])

  return { filters, setFilters, clearFilters }
}
