'use client'

import type React from 'react'
import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'
import { MenuIcon, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDebouncedCallback } from 'use-debounce'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'
import { useBookStore } from '@/integrations/zustand/book-store-provider'
import { Category } from '@/payload-types'
import { LanguageSwitcher } from '@/components/molecules/language-switcher'

type Props = {
  categoriesInBanner?: Category[]
}

export const HeaderClient = ({ categoriesInBanner = [] }: Props) => {
  const t = useTranslations('global.header')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const query = searchParams.get('q') ?? ''

  const isMobile = useIsMobile()
  const [searchValue, setSearchValue] = useState(query)
  const { toggleSidebar: onToggleMobileSidebar } = useBookStore((state) => state)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchValue(term)
    handleSearchChange(term)
  }

  const handleSearchChange = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`)

    const params = new URLSearchParams(searchParams)

    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }

    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  const categoriesInBannerJSX = categoriesInBanner.map((category) => (
    <Link key={category.id} href={`/categories/${category.slug}`}>
      {category.name}
    </Link>
  ))

  return (
    <>
      <div className="bg-unicef-blue-dark text-white py-2 text-center font-bold">
        {t('bannerAppTitle')}
      </div>
      <header className="sticky top-0 z-40 bg-unicef-blue text-white shadow-md">
        {/* Upper bar with logo and search */}
        <div className="px-4 py-2 flex items-center gap-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-unicef-blue-dark"
              onClick={onToggleMobileSidebar}
              aria-label="Toggle menu"
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
          )}

          <div className="flex items-center">
            <div className="h-10 w-24 bg-white rounded text-unicef-blue font-bold flex items-center justify-center">
              <Image src="/unicef-logo.png" alt="UNICEF" width="86" height="30" />
            </div>
          </div>

          <div className="flex-1 mx-2">
            <div className="relative">
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                className="bg-white text-black pr-10"
                value={searchValue}
                onChange={handleChange}
              />
              <Button
                type="submit"
                size="sm"
                variant="link"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 cursor-default"
                aria-label="Search"
                asChild
              >
                <div>
                  <Search className="size-4" />
                </div>
              </Button>
            </div>
          </div>

          <LanguageSwitcher />
        </div>

        {/* Lower navigation bar */}
        <div className="bg-unicef-blue-dark text-white px-4 py-1.5 hidden md:flex">
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/" className="hover:underline whitespace-nowrap">
              {t('allBooks')}
            </Link>
            {categoriesInBannerJSX}
          </nav>
        </div>
      </header>
    </>
  )
}
