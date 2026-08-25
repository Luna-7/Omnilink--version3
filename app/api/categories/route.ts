import { NextRequest, NextResponse } from 'next/server'
import {
  SEED_CATEGORIES,
  getCategoryTree,
  searchCategories,
  getPopularCategories,
  getCategoryById,
} from '@/lib/product/categories'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const tree = searchParams.get('tree')
  const popular = searchParams.get('popular')
  const id = searchParams.get('id')

  if (id) {
    const category = getCategoryById(id)
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json({ category })
  }

  if (q) {
    const results = searchCategories(q)
    return NextResponse.json({ results })
  }

  if (popular === 'true') {
    const popularList = getPopularCategories()
    return NextResponse.json({ categories: popularList })
  }

  if (tree === 'true') {
    const categoryTree = getCategoryTree()
    return NextResponse.json({ tree: categoryTree })
  }

  return NextResponse.json({
    categories: SEED_CATEGORIES,
    tree: getCategoryTree(),
  })
}
