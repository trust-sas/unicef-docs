import type { CollectionConfig } from 'payload'

import { formatSlug } from './hooks/formatSlug'
import { loggedIn } from './access/loggedIn'
import { publishedOrLoggedIn } from './access/publishedOrLoggedIn'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: loggedIn,
    delete: loggedIn,
    read: publishedOrLoggedIn,
    update: loggedIn,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [formatSlug('name')],
      },
      index: true,
      label: 'Slug',
    },
    {
      name: 'showInNavbar',
      type: 'checkbox',
    },
  ],
}
