import { getPayload, TypedLocale } from 'payload'
import config from '@payload-config'

import { SidebarClient } from './sidebar-client'

type Props = {
  locale: TypedLocale
}

export const Sidebar = async ({ locale }: Props) => {
  const payload = await getPayload({ config })
  const categories = await payload.find({
    collection: 'categories',
    sort: 'updatedAt',
    locale,
    limit: 1000,
  })

  return <SidebarClient facets={{ categories: categories.docs }} />
}
