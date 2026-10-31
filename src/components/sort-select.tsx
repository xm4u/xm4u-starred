import { ArrowUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SORT_KEYS, type SortKey } from '@/lib/types'

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey
  onChange: (sort: SortKey) => void
}) {
  const { t } = useTranslation()

  return (
    <Select value={value} onValueChange={(next) => onChange(next as SortKey)}>
      <SelectTrigger
        size="sm"
        className="gap-1.5 font-mono text-xs"
        aria-label={t('filters.sort')}
      >
        <ArrowUpDown className="size-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SORT_KEYS.map((key) => (
          <SelectItem key={key} value={key} className="font-mono text-[13px]">
            {t(`sort.${key}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
