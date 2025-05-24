import { BookGrid } from '@/components/organims/book-grid'
import { TypedLocale } from 'payload'
import { Suspense } from 'react'

type Props = {
  params: Promise<{
    locale: TypedLocale
    slug: string
  }>
  searchParams?: Promise<{
    q?: string
    'f-category'?: string
  }>
}

export default async function BooksOfCategoryPage(props: Props) {
  const { locale = 'en', slug } = await props.params
  const searchParams = await props.searchParams

  const fCategories = searchParams?.['f-category']
    ? Array.isArray(searchParams?.['f-category'])
      ? searchParams?.['f-category']
      : [searchParams?.['f-category']]
    : undefined

  return (
    <div className="flex flex-1 w-full">
      <Suspense fallback={'loading...'}>
        <BookGrid
          locale={locale}
          specificCategory={slug}
          searchParams={{ search: searchParams?.q, facets: { categories: fCategories } }}
        />
      </Suspense>
    </div>
  )
}
