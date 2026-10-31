import { useTranslation } from 'react-i18next'

import { GitHubIcon } from '@/components/github-icon'
import { LanguageToggle } from '@/components/language-toggle'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { siteRepoUrl } from '@/lib/repos'

const headerButtonClass =
  'text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring/40'

export function SiteHeader({ total, generatedAt }: { total: number; generatedAt: string }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage?.startsWith('es') ? 'es' : 'en'

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-card/90 text-card-foreground backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 font-mono text-base leading-none">
          <span className="font-medium tracking-tight">xm4u</span>
          <span aria-hidden className="text-primary">
            /
          </span>
          <span className="text-muted-foreground">starred</span>
        </div>

        <span className="hidden h-4 w-px bg-border sm:block" />

        <div className="hidden items-center gap-2 font-mono text-xs text-muted-foreground sm:flex">
          <span>{t('header.repos', { count: total })}</span>
          <span aria-hidden className="text-border">
            ·
          </span>
          <span>{t('header.synced', { date: formatDate(generatedAt, locale) })}</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <LanguageToggle className={headerButtonClass} />
          <ThemeToggle className={headerButtonClass} />
          <Button asChild variant="ghost" size="sm" className={headerButtonClass}>
            <a href={siteRepoUrl} target="_blank" rel="noreferrer" aria-label={t('app.repoLink')}>
              <GitHubIcon className="size-[18px]" />
              <span className="hidden font-mono text-xs sm:inline">GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
