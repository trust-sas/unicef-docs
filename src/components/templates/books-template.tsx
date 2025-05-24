import { ReactNode, Suspense } from 'react'
import { TypedLocale } from 'payload'

import { Header } from '@/components/organims/header/header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Sidebar } from '@/components/organims/sidebar/sidebar'

type Props = {
  children: ReactNode
  locale: TypedLocale
}

export const BooksTemplate = ({ children, locale }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={'loading...'}>
        <Header locale={locale} />
      </Suspense>

      <SidebarProvider>
        <div className="flex flex-col w-full min-h-screen">
          <div className="flex flex-1 relative">
            <Suspense fallback={'loading...'}>
              <Sidebar locale={locale} />
            </Suspense>

            <main className="flex-1 overflow-x-hidden p-4 md:p-6 ">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}
