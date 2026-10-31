import { useTranslation } from 'react-i18next'

import { categories } from '@/lib/categories'
import type { CategorySlug } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CategoryChipsProps {
  counts: Record<CategorySlug, number>
  selected: CategorySlug[]
  onToggle: (category: CategorySlug) => void
  onClear: () => void
}

export function CategoryChips({ counts, selected, onToggle, onClear }: CategoryChipsProps) {
  const { t } = useTranslation()
  const allCount = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5">
      <Chip
        active={selected.length === 0}
        label={t('filters.all')}
        count={allCount}
        onClick={onClear}
      />
      {categories.map((category) => (
        <Chip
          key={category.slug}
          active={selected.includes(category.slug)}
          label={t(`categories.${category.slug}`)}
          count={counts[category.slug]}
          color={category.color}
          onClick={() => onToggle(category.slug)}
        />
      ))}
    </div>
  )
}

function Chip({
  active,
  label,
  count,
  color,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  color?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[12.5px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card/70 text-muted-foreground hover:border-primary/40 hover:text-foreground',
        count === 0 && !active && 'opacity-45',
      )}
    >
      {color ? (
        <span
          aria-hidden
          className="size-1.5 rounded-full"
          style={{ backgroundColor: active ? '#ffffff' : color }}
        />
      ) : null}
      <span>{label}</span>
      <span
        className={cn(
          'text-[11px] tabular-nums',
          active ? 'text-primary-foreground' : 'text-muted-foreground',
        )}
      >
        {count}
      </span>
    </button>
  )
}
