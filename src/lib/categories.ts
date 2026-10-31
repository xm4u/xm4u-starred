import categoriesJson from '@/data/categories.json'
import type { Category, CategorySlug } from '@/lib/types'

export const categories = categoriesJson as Category[]

export const categoryOrder = categories.map((category) => category.slug)

export const categoryBySlug = new Map<CategorySlug, Category>(
  categories.map((category) => [category.slug, category]),
)

export function categoryColor(slug: CategorySlug): string {
  return categoryBySlug.get(slug)?.color ?? '#8AA3B6'
}
