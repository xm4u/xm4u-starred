import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState } from '@/components/empty-state'
import { FilterBar } from '@/components/filter-bar'
import { RepoGrid } from '@/components/repo-grid'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { useFilters } from '@/hooks/use-filters'
import {
  applyFilters,
  countByCategory,
  countByLanguage,
  countByTag,
  sortRepos,
} from '@/lib/filter'
import { repoData, repos } from '@/lib/repos'

export default function App() {
  const { t, i18n } = useTranslation()
  const { filters, setFilters, clearFilters } = useFilters()

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? 'en'
    document.title = t('app.title')
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('app.description'))
  }, [i18n.resolvedLanguage, t])

  const filtered = useMemo(
    () => sortRepos(applyFilters(repos, filters), filters.sort),
    [filters],
  )
  const categoryCounts = useMemo(() => countByCategory(repos, filters), [filters])
  const languageCounts = useMemo(() => countByLanguage(repos, filters), [filters])
  const tagCounts = useMemo(() => countByTag(repos, filters), [filters])

  const toggleTag = (tag: string) => {
    setFilters((previous) => ({
      ...previous,
      tags: previous.tags.includes(tag)
        ? previous.tags.filter((item) => item !== tag)
        : [...previous.tags, tag],
    }))
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader total={repoData.total} generatedAt={repoData.generated_at} />
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
        categoryCounts={categoryCounts}
        languageCounts={languageCounts}
        tagCounts={tagCounts}
        shown={filtered.length}
        total={repos.length}
      />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-4 sm:px-6">
        {filtered.length === 0 ? (
          <EmptyState onReset={clearFilters} />
        ) : (
          <RepoGrid repos={filtered} group={filters.group} onTagToggle={toggleTag} />
        )}
      </main>
      <SiteFooter generatedAt={repoData.generated_at} />
    </div>
  )
}
