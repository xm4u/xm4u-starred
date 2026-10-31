import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/components/ui/card'
import { categoryColor } from '@/lib/categories'
import { compactNumber, formatRelative, languageColor } from '@/lib/format'
import type { Repo } from '@/lib/types'

export function RepoCard({
  repo,
  onTagToggle,
}: {
  repo: Repo
  onTagToggle: (tag: string) => void
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage?.startsWith('es') ? 'es' : 'en'

  return (
    <Card className="group relative flex h-full flex-col gap-0 overflow-hidden rounded-xl border border-border/70 bg-card p-0 py-0 text-card-foreground ring-0 transition-colors duration-200 hover:border-primary/45 hover:bg-accent/10">
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[10.5px] tracking-[0.12em] text-muted-foreground uppercase">
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: categoryColor(repo.category) }}
            />
            <span className="truncate">{t(`categories.${repo.category}`)}</span>
            {repo.archived ? (
              <span className="rounded border border-amber-500/40 px-1 py-px text-[9.5px] tracking-normal text-amber-500 normal-case">
                {t('repo.archived')}
              </span>
            ) : null}
          </span>
          <span
            className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground tabular-nums"
            title={t('repo.stars', { count: repo.stars })}
          >
            <Star className="size-3" />
            {compactNumber(repo.stars, locale)}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-mono text-[15px] leading-6 font-medium">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm outline-none after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-muted-foreground">{repo.owner}/</span>
              <span className="text-foreground transition-colors group-hover:text-primary">
                {repo.name}
              </span>
            </a>
          </h3>
          <p className="mt-2 line-clamp-2 min-h-11 text-sm leading-[1.55] text-muted-foreground">
            {repo.description || '—'}
          </p>
        </div>

        {repo.note ? (
          <p className="border-l-2 border-primary/60 pl-2 text-[12.5px] leading-5 text-muted-foreground italic">
            {repo.note}
          </p>
        ) : null}

        {repo.tags.length > 0 ? (
          <div className="relative z-10 flex flex-wrap gap-1">
            {repo.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagToggle(tag)}
                title={t('repo.filterTag', { tag })}
                className="rounded border border-border/70 bg-secondary/40 px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                #{tag}
              </button>
            ))}
            {repo.tags.length > 3 ? (
              <span className="px-1 py-1 font-mono text-[11px] text-muted-foreground">
                +{repo.tags.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 px-4 py-2.5">
        <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: languageColor(repo.language) }}
          />
          <span className="truncate">{repo.language ?? '—'}</span>
        </span>
        <span className="shrink-0 font-mono text-[11.5px] text-muted-foreground">
          {t('repo.updated', { date: formatRelative(repo.pushed_at, locale) })}
        </span>
      </div>
    </Card>
  )
}
