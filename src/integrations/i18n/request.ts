import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

import en from './messages/en.json'
import { TypedLocale } from 'payload'

type Messages = typeof en

declare global {
  // Use type safe message keys with `next-intl`
  type IntlMessages = Messages
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as TypedLocale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
