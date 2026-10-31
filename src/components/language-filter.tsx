import { ChevronDown, Code2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { languageColor } from '@/lib/format'
import { cn } from '@/lib/utils'

interface LanguageChecklistProps {
  counts: Array<[string, number]>
  selected: string[]
  onToggle: (language: string) => void
  onClear: () => void
  className?: string
}

export function LanguageChecklist({
  counts,
  selected,
  onToggle,
  onClear,
  className,
}: LanguageChecklistProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between px-1.5 pb-1">
        <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          {t('filters.languages')}
        </span>
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="font-mono text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t('filters.clear')}
          </button>
        ) : null}
      </div>
      <div className="max-h-64 overflow-y-auto pr-1">
        {counts.length === 0 ? (
          <p className="px-1.5 py-2 text-xs text-muted-foreground">{t('filters.noLanguages')}</p>
        ) : (
          counts.map(([language, count]) => (
            <label
              key={language}
              className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-2 text-sm transition-colors hover:bg-accent"
            >
              <Checkbox
                checked={selected.includes(language)}
                onCheckedChange={() => onToggle(language)}
              />
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: languageColor(language) }}
              />
              <span className="min-w-0 flex-1 truncate">{language}</span>
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {count}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}

interface LanguageFilterProps {
  counts: Array<[string, number]>
  selected: string[]
  onToggle: (language: string) => void
  onClear: () => void
}

export function LanguageFilter({ counts, selected, onToggle, onClear }: LanguageFilterProps) {
  const { t } = useTranslation()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 font-mono text-[11px]">
          <Code2 className="size-3.5 text-muted-foreground" />
          {t('filters.language')}
          {selected.length > 0 ? (
            <Badge variant="secondary" className="h-4 px-1.5 font-mono text-[11px]">
              {selected.length}
            </Badge>
          ) : null}
          <ChevronDown className="size-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <LanguageChecklist
          counts={counts}
          selected={selected}
          onToggle={onToggle}
          onClear={onClear}
        />
      </PopoverContent>
    </Popover>
  )
}
