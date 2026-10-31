export function compactNumber(value: number, locale: string): string {
  if (value < 1000) return new Intl.NumberFormat(locale).format(value)
  const divisor = value >= 1_000_000 ? 1_000_000 : 1000
  const suffix = divisor === 1_000_000 ? 'M' : 'k'
  const scaled = value / divisor
  const digits = scaled >= 100 ? 0 : 1
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(scaled)
  return `${formatted}${suffix}`
}

export function formatRelative(iso: string, locale: string): string {
  const date = new Date(iso)
  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60_000)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute')
  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour')
  const diffDays = Math.round(diffHours / 24)
  if (Math.abs(diffDays) < 30) return formatter.format(diffDays, 'day')
  const diffMonths = Math.round(diffDays / 30)
  if (Math.abs(diffMonths) < 12) return formatter.format(diffMonths, 'month')
  return formatter.format(Math.round(diffMonths / 12), 'year')
}

export function formatDate(iso: string, locale: string, includeYear = false): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
  }).format(new Date(iso))
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#DEA584',
  HTML: '#E34C26',
  CSS: '#563D7C',
  SCSS: '#C6538C',
  Shell: '#89E051',
  Lua: '#6BA6D9',
  Nushell: '#4E9906',
  Markdown: '#519ABA',
  Java: '#B07219',
  'C++': '#F34B7D',
  C: '#A8B9CC',
  'C#': '#178600',
  'Jupyter Notebook': '#DA5B0B',
  MDX: '#FCB32C',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Ruby: '#CC342D',
  PHP: '#4F5D95',
  Elixir: '#6E4A7E',
  Haskell: '#5E5086',
  Zig: '#EC915C',
  Dart: '#00B4AB',
  Vue: '#41B883',
  Svelte: '#FF3E00',
  Astro: '#FF5A03',
  Dockerfile: '#384D54',
  PowerShell: '#012456',
  Clojure: '#DB5855',
  'Vim Script': '#199F4B',
  Nix: '#7E7EFF',
}

export function languageColor(language: string | null): string {
  if (!language) return '#8AA3B6'
  return LANGUAGE_COLORS[language] ?? '#8AA3B6'
}
