export type CategorySlug =
  | 'seguridad'
  | 'terminal'
  | 'agentes'
  | 'diseno'
  | 'gestion'
  | 'aprendizaje'
  | 'otros'

export interface Repo {
  full_name: string
  name: string
  owner: string
  html_url: string
  description: string
  language: string | null
  stars: number
  topics: string[]
  pushed_at: string
  starred_at: string
  archived: boolean
  fork: boolean
  category: CategorySlug
  category_source: 'auto' | 'override'
  tags: string[]
  note: string | null
}

export interface RepoData {
  username: string
  total: number
  generated_at: string
  repos: Repo[]
}

export interface Category {
  slug: CategorySlug
  color: string
  topics: string[]
  keywords: string[]
}

export type SortKey = 'starred' | 'stars' | 'pushed' | 'name'

export interface Filters {
  q: string
  cats: CategorySlug[]
  langs: string[]
  tags: string[]
  sort: SortKey
  group: boolean
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  cats: [],
  langs: [],
  tags: [],
  sort: 'starred',
  group: false,
}

export const SORT_KEYS: SortKey[] = ['starred', 'stars', 'pushed', 'name']
