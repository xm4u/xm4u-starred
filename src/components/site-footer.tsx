import { useTranslation } from 'react-i18next'

import { formatDate } from '@/lib/format'
import { siteRepoUrl } from '@/lib/repos'

export function SiteFooter({ generatedAt }: { generatedAt: string }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage?.startsWith('es') ? 'es' : 'en'

  return (
    <footer className="mt-10 border-t border-border/70">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-4 py-6 font-mono text-[11.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t('footer.built')}</p>
        <div className="flex items-center gap-3">
          <span>{t('footer.updated', { date: formatDate(generatedAt, locale, true) })}</span>
          <span aria-hidden className="text-border">
            /
          </span>
          <a
            href={siteRepoUrl}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            {t('footer.source')}
          </a>
        </div>
      </div>
    </footer>
  )
}
