import { getPayload, TypedLocale } from 'payload'
import config from '@payload-config'

import { HeaderClient } from './header-client'

type Props = {
  locale: TypedLocale
}

export const Header = async ({ locale }: Props) => {
  const payload = await getPayload({ config })
  const categories = await payload.find({
    collection: 'categories',
    sort: 'updatedAt',
    locale,
    where: {
      showInNavbar: {
        equals: true,
      },
    },
    limit: 5,
  })

  return <HeaderClient categoriesInBanner={categories.docs} />
}
