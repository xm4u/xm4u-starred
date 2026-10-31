import { useTranslation } from 'react-i18next'

import { RepoCard } from '@/components/repo-card'
import { categoryColor } from '@/lib/categories'
import { groupByCategory } from '@/lib/filter'
import type { Repo } from '@/lib/types'

const gridClass = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

export function RepoGrid({
  repos,
  group,
  onTagToggle,
}: {
  repos: Repo[]
  group: boolean
  onTagToggle: (tag: string) => void
}) {
  const { t } = useTranslation()

  if (!group) {
    return (
      <div className={gridClass}>
        {repos.map((repo) => (
          <RepoCard key={repo.full_name} repo={repo} onTagToggle={onTagToggle} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groupByCategory(repos).map((section) => (
        <section key={section.category} className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ backgroundColor: categoryColor(section.category) }}
            />
            <h2 className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
              {t(`categories.${section.category}`)}
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {section.repos.length}
            </span>
            <div aria-hidden className="ml-1 h-px flex-1 bg-border/70" />
          </div>
          <div className={gridClass}>
            {section.repos.map((repo) => (
              <RepoCard key={repo.full_name} repo={repo} onTagToggle={onTagToggle} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
