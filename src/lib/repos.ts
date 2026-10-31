import repoDataJson from '@/data/repos.json'
import type { RepoData } from '@/lib/types'

export const repoData = repoDataJson as RepoData
export const repos = repoData.repos
export const siteRepoUrl = 'https://github.com/xm4u/xm4u-starred'
export const username = repoData.username
