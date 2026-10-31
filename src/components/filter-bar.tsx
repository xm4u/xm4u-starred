import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActiveFilters } from '@/components/active-filters'
import { CategoryChips } from '@/components/category-chips'
import { GroupToggle } from '@/components/group-toggle'
import { LanguageChecklist, LanguageFilter } from '@/components/language-filter'
import { SortSelect } from '@/components/sort-select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { activeFilterCount } from '@/lib/filter'
import type { CategorySlug, Filters, SortKey } from '@/lib/types'

interface FilterBarProps {
  filters: Filters
  setFilters: (patch: Partial<Filters> | ((previous: Filters) => Filters)) => void
  clearFilters: () => void
  categoryCounts: Record<CategorySlug, number>
  languageCounts: Array<[string, number]>
  tagCounts: Array<[string, number]>
  shown: number
  total: number
}

export function FilterBar({
  filters,
  setFilters,
  clearFilters,
  categoryCounts,
  languageCounts,
  tagCounts,
  shown,
  total,
}: FilterBarProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(filters.q)
  const [sheetOpen, setSheetOpen] = useState(false)
  const active = activeFilterCount(filters)

  useEffect(() => {
    setQuery(filters.q)
  }, [filters.q])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query !== filters.q) setFilters({ q: query })
    }, 150)
    return () => window.clearTimeout(timer)
  }, [query, filters.q, setFilters])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const toggleCategory = (category: CategorySlug) => {
    setFilters((previous) => ({
      ...previous,
      cats: previous.cats.includes(category)
        ? previous.cats.filter((item) => item !== category)
        : [...previous.cats, category],
    }))
  }

  const toggleLanguage = (language: string) => {
    setFilters((previous) => ({
      ...previous,
      langs: previous.langs.includes(language)
        ? previous.langs.filter((item) => item !== language)
        : [...previous.langs, language],
    }))
  }

  const toggleTag = (tag: string) => {
    setFilters((previous) => ({
      ...previous,
      tags: previous.tags.includes(tag)
        ? previous.tags.filter((item) => item !== tag)
        : [...previous.tags, tag],
    }))
  }

  return (
    <div className="sticky top-16 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1440px] space-y-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  if (query) setQuery('')
                  else event.currentTarget.blur()
                }
              }}
              placeholder={t('filters.search')}
              aria-label={t('filters.search')}
              className="h-10 bg-card/70 pr-9 pl-9 text-base md:text-sm"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                aria-label={t('filters.clear')}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd
                title={t('filters.searchHint')}
                className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground"
              >
                /
              </kbd>
            )}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageFilter
              counts={languageCounts}
              selected={filters.langs}
              onToggle={toggleLanguage}
              onClear={() => setFilters({ langs: [] })}
            />
            <SortSelect
              value={filters.sort}
              onChange={(sort: SortKey) => setFilters({ sort })}
            />
            <GroupToggle
              group={filters.group}
              onToggle={() => setFilters({ group: !filters.group })}
            />
          </div>

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
                  <SlidersHorizontal className="size-3.5" />
                  {t('filters.open')}
                  {active > 0 ? (
                    <Badge variant="secondary" className="h-4 px-1.5 font-mono text-[10px]">
                      {active}
                    </Badge>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] gap-0 rounded-t-2xl p-0">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle className="font-mono text-base">{t('filters.open')}</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 overflow-y-auto p-4">
                  <LanguageChecklist
                    counts={languageCounts}
                    selected={filters.langs}
                    onToggle={toggleLanguage}
                    onClear={() => setFilters({ langs: [] })}
                  />
                  <Separator />
                  <div className="space-y-2">
                    <p className="px-1 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                      {t('filters.sort')}
                    </p>
                    <SortSelect
                      value={filters.sort}
                      onChange={(sort: SortKey) => setFilters({ sort })}
                    />
                  </div>
                  <GroupToggle
                    group={filters.group}
                    onToggle={() => setFilters({ group: !filters.group })}
                    className="w-full justify-start"
                  />
                </div>
                <SheetFooter className="border-t p-4">
                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    <span className="font-mono text-xs">{t('filters.clearAll')}</span>
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {active > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="hidden gap-1.5 font-mono text-xs text-muted-foreground lg:inline-flex"
            >
              <X className="size-3.5" />
              {t('filters.clear')}
            </Button>
          ) : null}
        </div>

        <CategoryChips
          counts={categoryCounts}
          selected={filters.cats}
          onToggle={toggleCategory}
          onClear={() => setFilters({ cats: [] })}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs text-muted-foreground tabular-nums">
            {t('filters.showing', { shown, total })}
          </p>
          <ActiveFilters
            filters={filters}
            onRemoveLanguage={toggleLanguage}
            onRemoveTag={toggleTag}
            onClear={() => setFilters({ langs: [], tags: [] })}
          />
        </div>
        {tagCounts.length > 0 ? (
          <div className="no-scrollbar -mx-1 hidden items-center gap-1.5 overflow-x-auto px-1 sm:flex">
            <span className="shrink-0 font-mono text-[10.5px] tracking-[0.12em] text-muted-foreground uppercase">
              {t('filters.tags')}
            </span>
            {tagCounts.slice(0, 12).map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={filters.tags.includes(tag)}
                className={
                  filters.tags.includes(tag)
                    ? 'shrink-0 rounded-full border border-primary bg-primary px-2.5 py-1 font-mono text-[11px] text-primary-foreground'
                    : 'shrink-0 rounded-full border border-border/70 bg-card/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground'
                }
              >
                #{tag}
                <span className="ml-1 opacity-60">{count}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
