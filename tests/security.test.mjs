import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  validateCategories,
  validateOverrides,
  validateDataset,
  validateStarredPayload,
  validGithubUrl,
} from '../scripts/validate-data.mjs'

const dataset = JSON.parse(await readFile(new URL('../src/data/repos.json', import.meta.url), 'utf8'))
const categories = JSON.parse(await readFile(new URL('../src/data/categories.json', import.meta.url), 'utf8'))
const overrides = JSON.parse(await readFile(new URL('../src/data/overrides.json', import.meta.url), 'utf8'))
const allowed = validateCategories(categories)

test('data and overrides satisfy validated schema', () => {
  assert.equal(validateDataset(dataset, allowed), true)
  assert.doesNotThrow(() => validateOverrides(overrides, allowed))
})

test('only actual repository destinations are accepted', () => {
  const name = dataset.repos[0].full_name
  assert.equal(validGithubUrl('https://github.com/' + name, name), true)
  assert.equal(validGithubUrl('https://example.com/' + name, name), false)
  assert.equal(validGithubUrl('https://github.com/' + name + '/issues', name), false)
})

test('invalid category, duplicates and inconsistent counts are rejected', () => {
  const badCategory = structuredClone(dataset)
  badCategory.repos[0].category = 'invalid'
  assert.throws(() => validateDataset(badCategory, allowed), /unknown category/)
  const badCount = structuredClone(dataset)
  badCount.total += 1
  assert.throws(() => validateDataset(badCount, allowed), /total does not match/)
  const duplicated = structuredClone(dataset)
  duplicated.repos.push(structuredClone(duplicated.repos[0]))
  duplicated.total += 1
  assert.throws(() => validateDataset(duplicated, allowed), /duplicate repository/)
})

test('invalid overrides are rejected', () => {
  assert.throws(() => validateOverrides({ 'owner/name': { category: 'invalid' } }, allowed), /unknown category/)
  assert.throws(() => validateOverrides({ 'owner/name': { tags: 'invalid' } }, allowed), /invalid tags/)
})

test('GitHub API payload validates before writing to disk', () => {
  const repo = dataset.repos[0]
  const item = {
    starred_at: repo.starred_at,
    repo: { ...repo, owner: { login: repo.owner }, stargazers_count: repo.stars },
  }
  assert.doesNotThrow(() => validateStarredPayload([item]))
  const bad = structuredClone(item)
  bad.repo.html_url = 'https://example.com/fake'
  assert.throws(() => validateStarredPayload([bad]), /invalid GitHub URL/)
  assert.throws(() => validateStarredPayload([item, item]), /duplicate repository/)
  assert.throws(() => validateStarredPayload([]), /nonempty/)
})

test('all GitHub Actions use pinned commits and write access is isolated', async () => {
  const workflow = await readFile(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')
  const actions = [...workflow.matchAll(/uses:\s+actions\/[\w-]+@([^\s]+)/g)]
  assert.ok(actions.length >= 7)
  for (const match of actions) assert.match(match[1], /^[a-f0-9]{40}$/)
  assert.match(workflow, /permissions: \{\}/)
  assert.match(workflow, /sync:[\s\S]*?permissions:\s*\n\s*contents: read/)
  assert.match(workflow, /commit:[\s\S]*?permissions:\s*\n\s*contents: write/)
  assert.match(workflow, /build:[\s\S]*?permissions:\s*\n\s*contents: read/)
  assert.doesNotMatch(workflow, /git -c .*extraheader/)
  assert.match(workflow, /GIT_CONFIG_VALUE_0/)
})
