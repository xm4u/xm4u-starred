import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function check(condition, message) {
  if (!condition) throw new Error(`Invalid repository data: ${message}`)
}

const text = (value, limit = 10_000) =>
  typeof value === 'string' && value.length > 0 && value.length <= limit
const strings = (value, max = 250) =>
  Array.isArray(value) && value.length <= max && value.every((v) => text(v, 500))
const date = (value) => text(value, 50) && Number.isFinite(Date.parse(value))

export function validGithubUrl(value, fullName) {
  if (!text(value, 500) || !text(fullName, 200)) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'github.com' &&
      url.port === '' && url.username === '' && url.password === '' &&
      url.pathname === `/${fullName}` && url.search === '' && url.hash === ''
  } catch {
    return false
  }
}

export function validateCategories(categories) {
  check(Array.isArray(categories) && categories.length > 0, 'categories must be a nonempty array')
  const names = new Set()
  for (const category of categories) {
    check(category && typeof category === 'object', 'invalid category')
    check(text(category.slug, 50) && /^[a-z0-9-]+$/.test(category.slug), 'invalid category slug')
    check(!names.has(category.slug), `duplicate category ${category.slug}`)
    check(strings(category.topics) && strings(category.keywords), `invalid keywords for ${category.slug}`)
    names.add(category.slug)
  }
  check(names.has('otros'), 'missing fallback category')
  return names
}

export function validateOverrides(overrides, categories) {
  check(overrides && typeof overrides === 'object' && !Array.isArray(overrides), 'invalid overrides')
  for (const [fullName, metadata] of Object.entries(overrides)) {
    check(text(fullName, 200) && fullName.includes('/'), 'invalid override repository name')
    check(metadata && typeof metadata === 'object' && !Array.isArray(metadata),
      `invalid override for ${fullName}`)
    check(metadata.category === undefined || categories.has(metadata.category),
      `unknown category override for ${fullName}`)
    check(metadata.tags === undefined || strings(metadata.tags, 100),
      `invalid tags for ${fullName}`)
    check(metadata.note === undefined || metadata.note === null || text(metadata.note, 1000),
      `invalid note for ${fullName}`)
  }
}

function validateRepoFields(repo) {
  check(repo && typeof repo === 'object' && !Array.isArray(repo), 'invalid repo')
  check(text(repo.full_name, 200) && /^[^/]+\/[^/]+$/.test(repo.full_name),
    'invalid full_name')
  check(text(repo.name, 200) && text(repo.owner, 100), `invalid identity for ${repo.full_name}`)
  check(validGithubUrl(repo.html_url, repo.full_name), `invalid GitHub URL for ${repo.full_name}`)
  check(repo.description === '' || text(repo.description), `invalid description for ${repo.full_name}`)
  check(repo.language === null || text(repo.language, 200), `invalid language for ${repo.full_name}`)
  check(Number.isSafeInteger(repo.stars) && repo.stars >= 0, `invalid stars for ${repo.full_name}`)
  check(strings(repo.topics), `invalid topics for ${repo.full_name}`)
  check(date(repo.pushed_at) && date(repo.starred_at), `invalid timestamps for ${repo.full_name}`)
  check(typeof repo.archived === 'boolean' && typeof repo.fork === 'boolean',
    `invalid flags for ${repo.full_name}`)
}

export function validateStarredPayload(starred) {
  check(Array.isArray(starred) && starred.length > 0 && starred.length <= 50_000,
    'GitHub starred payload must be a nonempty, bounded array')
  const seen = new Set()
  for (const item of starred) {
    check(item && typeof item === 'object' && date(item.starred_at), 'invalid starred entry')
    const repo = item.repo
    check(repo && repo.owner && typeof repo.owner === 'object', 'missing repository owner')
    validateRepoFields({
      full_name: repo.full_name,
      name: repo.name,
      owner: repo.owner.login,
      html_url: repo.html_url,
      description: repo.description ?? '',
      language: repo.language ?? null,
      stars: repo.stargazers_count,
      topics: repo.topics ?? [],
      pushed_at: repo.pushed_at,
      starred_at: item.starred_at,
      archived: repo.archived,
      fork: repo.fork,
    })
    check(!seen.has(repo.full_name), `duplicate repository ${repo.full_name}`)
    seen.add(repo.full_name)
  }
}

export function validateDataset(dataset, categories) {
  check(dataset && typeof dataset === 'object' && !Array.isArray(dataset), 'invalid dataset object')
  check(text(dataset.username, 100) && date(dataset.generated_at), 'invalid metadata')
  check(Array.isArray(dataset.repos) && dataset.repos.length > 0 && dataset.repos.length <= 50_000,
    'invalid repo collection')
  check(dataset.total === dataset.repos.length, 'total does not match repositories')
  const seen = new Set()
  for (const repo of dataset.repos) {
    validateRepoFields(repo)
    check(categories.has(repo.category), `unknown category for ${repo.full_name}`)
    check(['auto', 'override'].includes(repo.category_source), `invalid category source for ${repo.full_name}`)
    check(strings(repo.tags, 100), `invalid tags for ${repo.full_name}`)
    check(repo.note === null || text(repo.note, 1000), `invalid note for ${repo.full_name}`)
    check(!seen.has(repo.full_name), `duplicate repository ${repo.full_name}`)
    seen.add(repo.full_name)
  }
  return true
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = resolve(process.argv[2] ?? 'src/data/repos.json')
  const categories = validateCategories(JSON.parse(await readFile(
    new URL('../src/data/categories.json', import.meta.url), 'utf8',
  )))
  const overrides = JSON.parse(await readFile(new URL('../src/data/overrides.json', import.meta.url), 'utf8'))
  validateOverrides(overrides, categories)
  const data = JSON.parse(await readFile(file, 'utf8'))
  validateDataset(data, categories)
  console.log(`Validated ${data.total} repositories in ${file}`)
}
