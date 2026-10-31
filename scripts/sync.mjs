#!/usr/bin/env node
/**
 * Sync the starred repositories of a GitHub user into src/data/repos.json.
 *
 * - Uses the public starred endpoint, authenticated when a token is available.
 * - Merges manual categories/tags/notes from overrides.json.
 * - Auto-classifies anything not present in overrides.json.
 * - Only rewrites the file when repository data actually changed, so the
 *   scheduled workflow does not create empty commits.
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { classify } from './classify.mjs'
import { validateCategories, validateOverrides, validateStarredPayload, validateDataset } from './validate-data.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA_DIR = path.join(ROOT, 'src', 'data')
const REPOS_FILE = path.join(DATA_DIR, 'repos.json')
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json')
const OVERRIDES_FILE = path.join(DATA_DIR, 'overrides.json')

const USERNAME = process.env.STARRED_USER ?? 'xm4u'
const TOKEN = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? ''
const PER_PAGE = 100

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))

const categories = await readJson(CATEGORIES_FILE)
const overrides = await readJson(OVERRIDES_FILE)
const categorySet = validateCategories(categories)
validateOverrides(overrides, categorySet)

async function fetchStarred() {
  const headers = {
    Accept: 'application/vnd.github.star+json',
    'User-Agent': 'xm4u-starred-sync',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`

  const all = []
  for (let page = 1; ; page += 1) {
    const url = `https://api.github.com/users/${USERNAME}/starred?per_page=${PER_PAGE}&page=${page}`
    const response = await fetch(url, { headers })
    if (!response.ok) {
      const body = await response.text()
      throw new Error(`GitHub API ${response.status} on page ${page}: ${body.slice(0, 300)}`)
    }
    const batch = await response.json()
    all.push(...batch)
    if (batch.length < PER_PAGE) break
  }
  return all
}

const starred = await fetchStarred()
validateStarredPayload(starred)

const repos = starred
  .map(({ starred_at: starredAt, repo }) => {
    const override = overrides[repo.full_name] ?? {}
    return {
      full_name: repo.full_name,
      name: repo.name,
      owner: repo.owner?.login ?? repo.full_name.split('/')[0],
      html_url: repo.html_url,
      description: repo.description ?? '',
      language: repo.language ?? null,
      stars: repo.stargazers_count ?? 0,
      topics: repo.topics ?? [],
      pushed_at: repo.pushed_at,
      starred_at: starredAt,
      archived: Boolean(repo.archived),
      fork: Boolean(repo.fork),
      category: override.category ?? classify(repo, categories),
      category_source: override.category ? 'override' : 'auto',
      tags: override.tags ?? [],
      note: override.note ?? null,
    }
  })
  .sort((a, b) => a.full_name.localeCompare(b.full_name))

const next = {
  username: USERNAME,
  total: repos.length,
  repos,
}

let previous = null
try {
  previous = JSON.parse(await readFile(REPOS_FILE, 'utf8'))
} catch {
  // First run.
}

const same =
  previous &&
  previous.username === next.username &&
  JSON.stringify(previous.repos) === JSON.stringify(next.repos)

if (same) {
  console.log(`No changes (${repos.length} starred repositories).`)
  process.exit(0)
}

const output = {
  ...next,
  generated_at: new Date().toISOString(),
}

validateDataset(output, categorySet)
await writeFile(REPOS_FILE, `${JSON.stringify(output, null, 2)}\n`)
console.log(`Wrote ${repos.length} starred repositories to src/data/repos.json.`)
