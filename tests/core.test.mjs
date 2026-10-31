import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'
import { classify } from '../scripts/classify.mjs'

const categories = JSON.parse(await readFile(new URL('../src/data/categories.json', import.meta.url)))
const vite = await createServer({
  configFile: new URL('../vite.config.ts', import.meta.url).pathname,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})
const filter = await vite.ssrLoadModule('/src/lib/filter.ts')
const url = await vite.ssrLoadModule('/src/lib/filter-url.ts')
const history = await vite.ssrLoadModule('/src/lib/filter-history.ts')
const { DEFAULT_FILTERS } = await vite.ssrLoadModule('/src/lib/types.ts')

const repo = (name, extra = {}) => ({
  full_name: 'owner/' + name,
  name,
  owner: 'owner',
  description: '',
  language: 'TypeScript',
  topics: [],
  tags: [],
  note: null,
  category: 'agentes',
  stars: 3,
  pushed_at: '2026-01-02T00:00:00Z',
  starred_at: '2026-01-03T00:00:00Z',
  ...extra,
})
const list = [
  repo('alpha', { tags: ['mcp', 'tools'], stars: 8 }),
  repo('beta', { category: 'seguridad', language: 'Rust', tags: ['tools'], stars: 2 }),
  repo('gamma', { tags: ['mcp'], description: 'Gestión de agentes', stars: 15 }),
]

try {
  test('accent-insensitive search matches descriptions', () => {
    assert.deepEqual(filter.applyFilters(list, { ...DEFAULT_FILTERS, q: 'gestion' }).map(r => r.name), ['gamma'])
  })
  test('category, language and tag filters combine with AND across facets', () => {
    const filters = { ...DEFAULT_FILTERS, cats: ['agentes'], langs: ['TypeScript'], tags: ['mcp', 'tools'] }
    assert.deepEqual(filter.applyFilters(list, filters).map(r => r.name), ['alpha'])
  })
  test('facet counts ignore only their own facet', () => {
    const filters = { ...DEFAULT_FILTERS, cats: ['seguridad'], tags: ['tools'] }
    assert.equal(filter.countByCategory(list, filters).agentes, 1)
    assert.deepEqual(filter.countByLanguage(list, filters), [['Rust', 1]])
  })
  test('sorting never mutates input and handles ties by name', () => {
    const sorted = filter.sortRepos(list, 'stars')
    assert.deepEqual(sorted.map(r => r.name), ['gamma', 'alpha', 'beta'])
    assert.deepEqual(list.map(r => r.name), ['alpha', 'beta', 'gamma'])
  })
  test('URL state roundtrip preserves Unicode and selections', () => {
    const state = { ...DEFAULT_FILTERS, q: 'diseño & IA', cats: ['agentes'], langs: ['C++'], tags: ['mcp', 'skills'], sort: 'stars', group: true }
    const encoded = url.serializeFilters(state, '/xm4u-starred/')
    assert.deepEqual(url.readFiltersFromSearch(new URL(encoded, 'https://example.org').search), state)
  })
  test('invalid category and sort URL parameters are ignored', () => {
    const state = url.readFiltersFromSearch('?cat=invalid,terminal&sort=oops&group=0')
    assert.deepEqual(state.cats, ['terminal'])
    assert.equal(state.sort, 'starred')
    assert.equal(state.group, false)
  })
  test('URL serialization preserves unrelated parameters, repeated keys and hash', () => {
    const state = { ...DEFAULT_FILTERS, cats: ['seguridad', 'agentes'], langs: ['C++'] }
    const result = url.serializeFilters(state, 'https://example.org/xm4u-starred/?utm_source=link&ref=one&ref=two&cat=terminal#repos')
    const parsed = new URL(result, 'https://example.org')
    assert.equal(parsed.pathname, '/xm4u-starred/')
    assert.equal(parsed.hash, '#repos')
    assert.equal(parsed.searchParams.get('utm_source'), 'link')
    assert.deepEqual(parsed.searchParams.getAll('ref'), ['one', 'two'])
    assert.equal(parsed.searchParams.get('cat'), 'seguridad,agentes')
    assert.equal(parsed.searchParams.get('lang'), 'C++')
    assert.deepEqual(url.readFiltersFromSearch(parsed.search).cats, ['seguridad', 'agentes'])
  })
  test('clearing filters removes only app-managed params', () => {
    const result = url.serializeFilters(DEFAULT_FILTERS, '/xm4u-starred/?ref=keep&q=old&sort=stars&group=1#section')
    assert.equal(result, '/xm4u-starred/?ref=keep#section')
  })
  test('one history entry for multiple filtering actions; Back and Forward restore states', () => {
    const entries = ['https://example.org/xm4u-starred/?ref=external#repos']
    let position = 0
    const actions = []
    const controller = history.createFilterHistoryController()

    const commit = (filters) => controller.commit(filters, entries[position], (method, nextUrl) => {
      const absolute = new URL(nextUrl, entries[position]).href
      actions.push(method)
      if (method === 'pushState') {
        entries.splice(position + 1)
        entries.push(absolute)
        position += 1
      } else {
        entries[position] = absolute
      }
    })

    assert.equal(commit(DEFAULT_FILTERS), false)
    assert.equal(commit({ ...DEFAULT_FILTERS, cats: ['seguridad'] }), true)
    assert.equal(commit({ ...DEFAULT_FILTERS, cats: ['seguridad', 'terminal'] }), true)
    assert.equal(commit({ ...DEFAULT_FILTERS, cats: ['seguridad', 'terminal'], sort: 'stars' }), true)
    assert.deepEqual(actions, ['pushState', 'replaceState', 'replaceState'])
    assert.equal(entries.length, 2)

    position -= 1 // Browser Back triggers popstate.
    controller.reset()
    assert.deepEqual(url.readFiltersFromSearch(new URL(entries[position]).search), DEFAULT_FILTERS)

    position += 1 // Browser Forward triggers popstate.
    controller.reset()
    const latest = url.readFiltersFromSearch(new URL(entries[position]).search)
    assert.deepEqual(latest.cats, ['seguridad', 'terminal'])
    assert.equal(latest.sort, 'stars')

    assert.equal(commit({ ...latest, tags: ['mcp'] }), true)
    assert.equal(actions.at(-1), 'pushState')
    assert.equal(entries.length, 3)
    assert.equal(new URL(entries[position]).hash, '#repos')
  })
  test('classifier favors GitHub topics and falls back to otros', () => {
    assert.equal(classify({ name: 'unknown', full_name: 'x/unknown', topics: ['neovim'] }, categories), 'terminal')
    assert.equal(classify({ name: 'unknown', full_name: 'x/unknown', topics: [] }, categories), 'otros')
  })
  test('classifier recognizes descriptions and diacritics', () => {
    assert.equal(classify({ name: 'tool', full_name: 'x/tool', description: 'A seguridad security scanner', topics: [] }, categories), 'seguridad')
  })
} finally {
  // Close after all registered tests have completed.
  test.after(async () => { await vite.close() })
}
