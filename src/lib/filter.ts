import { categoryOrder } from '@/lib/categories'
import type { CategorySlug, Filters, Repo, SortKey } from '@/lib/types'

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function searchHaystack(repo: Repo): string {
  return normalize(
    [
      repo.full_name,
      repo.name,
      repo.owner,
      repo.description,
      repo.language ?? '',
      ...repo.topics,
      ...repo.tags,
      repo.note ?? '',
    ].join(' '),
  )
}

type Skip = 'cats' | 'langs' | 'tags' | null

export function applyFilters(list: Repo[], filters: Filters, skip: Skip = null): Repo[] {
  const query = normalize(filters.q.trim())

  return list.filter((repo) => {
    if (query && !searchHaystack(repo).includes(query)) return false
    if (skip !== 'cats' && filters.cats.length > 0 && !filters.cats.includes(repo.category)) {
      return false
    }
    if (
      skip !== 'langs' &&
      filters.langs.length > 0 &&
      (!repo.language || !filters.langs.includes(repo.language))
    ) {
      return false
    }
    if (
      skip !== 'tags' &&
      filters.tags.length > 0 &&
      !filters.tags.every((tag) => repo.tags.includes(tag))
    ) {
      return false
    }
    return true
  })
}

export function sortRepos(list: Repo[], sort: SortKey): Repo[] {
  const sorted = [...list]
  sorted.sort((a, b) => {
    let result = 0
    if (sort === 'stars') result = b.stars - a.stars
    if (sort === 'pushed') result = b.pushed_at.localeCompare(a.pushed_at)
    if (sort === 'starred') result = b.starred_at.localeCompare(a.starred_at)
    if (sort === 'name') result = a.full_name.localeCompare(b.full_name)
    return result || a.full_name.localeCompare(b.full_name)
  })
  return sorted
}

export function countByCategory(list: Repo[], filters: Filters): Record<CategorySlug, number> {
  const base = applyFilters(list, filters, 'cats')
  const counts = Object.fromEntries(categoryOrder.map((slug) => [slug, 0])) as Record<
    CategorySlug,
    number
  >
  for (const repo of base) counts[repo.category] += 1
  return counts
}

export function countByLanguage(list: Repo[], filters: Filters): Array<[string, number]> {
  const base = applyFilters(list, filters, 'langs')
  const counts = new Map<string, number>()
  for (const repo of base) {
    if (!repo.language) continue
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

export function countByTag(list: Repo[], filters: Filters): Array<[string, number]> {
  const base = applyFilters(list, filters, 'tags')
  const counts = new Map<string, number>()
  for (const repo of base) {
    for (const tag of repo.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

export function groupByCategory(list: Repo[]): Array<{ category: CategorySlug; repos: Repo[] }> {
  const groups = new Map<CategorySlug, Repo[]>()
  for (const repo of list) {
    const bucket = groups.get(repo.category)
    if (bucket) bucket.push(repo)
    else groups.set(repo.category, [repo])
  }
  return categoryOrder
    .filter((slug) => groups.has(slug))
    .map((slug) => ({ category: slug, repos: groups.get(slug) ?? [] }))
}

export function activeFilterCount(filters: Filters): number {
  return (
    filters.cats.length +
    filters.langs.length +
    filters.tags.length +
    (filters.q.trim() ? 1 : 0)
  )
}
