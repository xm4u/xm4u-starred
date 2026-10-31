export const normalize = (value) =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

function matches(text, needle) {
  if (!needle) return false
  if (needle.length <= 3) {
    return new RegExp(`(^|[^a-z0-9])${needle}([^a-z0-9]|$)`, 'i').test(text)
  }
  return text.includes(needle)
}

export function classify(repo, categories) {
  const topics = (repo.topics ?? []).map(normalize)
  const text = normalize(
    [repo.name, repo.full_name, repo.description ?? '', ...(repo.topics ?? [])].join(' '),
  )

  let best = { slug: 'otros', score: 0 }
  for (const category of categories) {
    if (category.slug === 'otros') continue
    let score = 0
    for (const topic of category.topics) {
      if (topics.includes(normalize(topic))) score += 5
    }
    for (const keyword of category.keywords) {
      if (matches(text, normalize(keyword))) score += 2
    }
    if (score > best.score) best = { slug: category.slug, score }
  }
  return best.slug
}
