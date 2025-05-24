import type { CollectionConfig } from 'payload'

import { formatSlug } from './hooks/formatSlug'

export const Books: CollectionConfig = {
  slug: 'books',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['cover', 'title', 'slug', 'updatedAt'],
    // livePreview: {
    //   url: ({ data }) => {
    //     return `${process.env.NEXT_PUBLIC_SERVER_URL}/books`
    //   },
    // },
  },
  fields: [
    {
      name: 'categories',
      type: 'relationship',
      relationTo: ['categories'],
      required: true,
      hasMany: true,
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'monthOnly',
          displayFormat: 'MMM yyy',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      // unique: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
      index: true,
      label: 'Slug',
      // access: {
      //   read: () => true,
      // },
    },
    {
      name: 'resume',
      type: 'richText',
      localized: true,
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      required: true,
      localized: true,
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'books',
      type: 'upload',
      relationTo: 'media',
      required: true,
      localized: true,
    },
  ],
}
