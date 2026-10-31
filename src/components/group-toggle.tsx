import { LayoutGrid } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export function GroupToggle({
  group,
  onToggle,
  className,
}: {
  group: boolean
  onToggle: () => void
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <Button
      variant={group ? 'secondary' : 'outline'}
      size="sm"
      onClick={onToggle}
      aria-pressed={group}
      className={className}
    >
      <LayoutGrid className="size-4 text-muted-foreground" />
      <span className="font-mono text-xs">{t('filters.group')}</span>
    </Button>
  )
}
