import { categoryOrder } from '@/lib/categories'
import { DEFAULT_FILTERS, SORT_KEYS, type CategorySlug, type Filters, type SortKey } from '@/lib/types'

function parseList(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function readFiltersFromSearch(search: string): Filters {
  const params = new URLSearchParams(search)

  const cats = parseList(params.get('cat')).filter((value): value is CategorySlug =>
    categoryOrder.includes(value as CategorySlug),
  )
  const sortParam = params.get('sort') as SortKey | null

  return {
    q: params.get('q') ?? '',
    cats,
    langs: parseList(params.get('lang')),
    tags: parseList(params.get('tag')),
    sort: sortParam && SORT_KEYS.includes(sortParam) ? sortParam : DEFAULT_FILTERS.sort,
    group: params.get('group') === '1',
  }
}

const FILTER_KEYS = ['q', 'cat', 'lang', 'tag', 'sort', 'group'] as const

export function serializeFilters(filters: Filters, currentHref: string): string {
  // Keep foreign query parameters and anchors intact.
  const url = new URL(currentHref, 'https://example.invalid')
  const params = url.searchParams
  for (const key of FILTER_KEYS) params.delete(key)

  if (filters.q.trim()) params.set('q', filters.q.trim())
  if (filters.cats.length) params.set('cat', filters.cats.join(','))
  if (filters.langs.length) params.set('lang', filters.langs.join(','))
  if (filters.tags.length) params.set('tag', filters.tags.join(','))
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort)
  if (filters.group) params.set('group', '1')

  return url.pathname + url.search + url.hash
}
