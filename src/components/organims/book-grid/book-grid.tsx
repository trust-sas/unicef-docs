import { BasePayload, getPayload, TypedLocale, Where, WhereField } from 'payload'
import config from '@payload-config'

import { BookGridClient } from './book-grid-client'

type Props = {
  locale: TypedLocale
  specificCategory?: string
  searchParams: {
    search?: string
    facets: {
      categories?: string[]
    }
  }
}

export const BookGrid = async (props: Props) => {
  const { locale } = props
  const payload = await getPayload({ config })
  const query = await getQuery(payload, props)

  const books = await payload.find({
    collection: 'books',
    sort: 'updatedAt',
    locale,
    limit: 1000,
    where: query,
  })

  return <BookGridClient books={books.docs} />
}

async function getQuery(payload: BasePayload, props: Props): Promise<Where> {
  const { locale, searchParams, specificCategory } = props
  const { facets, search } = searchParams
  const facetsQueries: Map<string, WhereField> = new Map()
  const searchQuery: Map<string, WhereField> = new Map()
  const specificCategoryQuery: Map<string, WhereField> = new Map()

  if (search) {
    searchQuery.set('title', {
      like: search,
    })
  }

  if (specificCategory) {
    const categoryId = (
      await payload.find({
        collection: 'categories',
        locale,
        where: {
          slug: {
            equals: specificCategory,
          },
        },
        select: {},
      })
    ).docs.at(0)?.id

    if (!categoryId) {
      throw new Error('Category not found')
    }

    specificCategoryQuery.set('categories.value', {
      equals: categoryId,
    })
  }

  if (Boolean(facets.categories)) {
    const categoryIds = (
      await payload.find({
        collection: 'categories',
        locale,
        pagination: false,
        where: {
          slug: {
            in: facets.categories,
          },
        },
        select: {},
      })
    ).docs.map((c) => c.id)

    facetsQueries.set('categories.value', {
      in: categoryIds,
    })
  }

  return {
    and: [
      Object.fromEntries(searchQuery.entries()),
      Object.fromEntries(specificCategoryQuery.entries()),
      Object.fromEntries(facetsQueries.entries()),
    ],
  }
}
