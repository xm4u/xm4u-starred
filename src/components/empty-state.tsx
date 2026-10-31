import { RotateCcw, SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export function EmptyState({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[42vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-card/40 px-6 py-16 text-center">
      <SearchX className="size-7 text-muted-foreground" />
      <div>
        <p className="font-mono text-base text-foreground">{t('filters.empty')}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('filters.emptyHint')}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw className="size-4" />
        <span className="font-mono text-xs">{t('filters.reset')}</span>
      </Button>
    </div>
  )
}
