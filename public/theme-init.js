;(() => {
  try {
    const stored = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = stored === 'dark' || ((!stored || stored === 'system') && systemDark)
    document.documentElement.classList.toggle('dark', dark)
  } catch {
    /* no-op */
  }
})()
