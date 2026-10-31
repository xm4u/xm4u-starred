import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { languageColor } from '@/lib/format'
import type { Filters } from '@/lib/types'

export function ActiveFilters({
  filters,
  onRemoveLanguage,
  onRemoveTag,
  onClear,
}: {
  filters: Filters
  onRemoveLanguage: (language: string) => void
  onRemoveTag: (tag: string) => void
  onClear: () => void
}) {
  const { t } = useTranslation()
  const count = filters.langs.length + filters.tags.length

  if (count === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.langs.map((language) => (
        <button
          key={`lang-${language}`}
          type="button"
          onClick={() => onRemoveLanguage(language)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11.5px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <span
            aria-hidden
            className="size-1.5 rounded-full"
            style={{ backgroundColor: languageColor(language) }}
          />
          {language}
          <X className="size-3 opacity-60" />
        </button>
      ))}
      {filters.tags.map((tag) => (
        <button
          key={`tag-${tag}`}
          type="button"
          onClick={() => onRemoveTag(tag)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11.5px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          #{tag}
          <X className="size-3 opacity-60" />
        </button>
      ))}
      {count > 1 ? (
        <button
          type="button"
          onClick={onClear}
          className="px-1 font-mono text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {t('filters.clearAll')}
        </button>
      ) : null}
    </div>
  )
}
