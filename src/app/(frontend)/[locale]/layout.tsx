import React from 'react'
import type { Metadata } from 'next'
import { TypedLocale } from 'payload'
import { notFound } from 'next/navigation'
// import { draftMode } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'

import './globals.css'
import { routing } from '@/integrations/i18n/routing'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { InitTheme } from '@/integrations/theme/Theme/InitTheme'
import { ThemeProviders } from '@/integrations/theme'
import { LivePreviewListener } from '@/components/particles/live-preview-listener'
import { BookStoreProvider } from '@/integrations/zustand/book-store-provider'
import { BooksTemplate } from '@/components/templates/books-template'

type Props = {
  children: React.ReactNode
  params: Promise<{
    locale: TypedLocale
  }>
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as TypedLocale)) {
    notFound()
  }
  setRequestLocale(locale)

  // const { isEnabled } = await draftMode()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <InitTheme />
        {/* <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" /> */}
      </head>
      <body>
        <ThemeProviders>
          <NextIntlClientProvider messages={messages}>
            <LivePreviewListener />

            <BookStoreProvider>
              <BooksTemplate locale={locale}>{children}</BooksTemplate>
            </BookStoreProvider>
          </NextIntlClientProvider>
        </ThemeProviders>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: {
    default: 'Home',
    template: '%s | UNICEF Docs',
  },
  description: 'Home page.',
  // icons: SiteConfig.icons,
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
