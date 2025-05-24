import { Suspense } from 'react'
import { TypedLocale } from 'payload'

import { BookGrid } from '@/components/organims/book-grid'

type Props = {
  params: Promise<{
    locale: TypedLocale
  }>
  searchParams?: Promise<{
    q?: string
    'f-category'?: string
  }>
}

export default async function BooksPage(props: Props) {
  const { locale = 'en' } = await props.params
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
          searchParams={{ search: searchParams?.q, facets: { categories: fCategories } }}
        />
      </Suspense>
    </div>
  )
}
