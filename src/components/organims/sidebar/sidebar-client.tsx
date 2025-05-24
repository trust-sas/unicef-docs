'use client'

import { XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

import { Category } from '@/payload-types'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useBookStore } from '@/integrations/zustand/book-store-provider'
import { Filter } from '../filter'

type Props = {
  facets: {
    categories: Category[]
  }
}

export const SidebarClient = ({ facets }: Props) => {
  const { isSidebarOpen, closeSidebar: onClose } = useBookStore((state) => state)
  const isMobile = useIsMobile()
  const isOpen = isSidebarOpen || !isMobile

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <Sidebar
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-transform duration-300 ease-in-out md:sticky md:top-[105px] md:h-[calc(100vh-105px)] z-30`}
        variant="floating"
        collapsible="offcanvas"
      >
        <SidebarHeader className="md:hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-bold text-lg text-unicef-blue">Filters</h2>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close filters">
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {/* {activeFilters.length > 0 && (
            <SidebarGroup>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {activeFilters.length} {activeFilters.length === 1 ? 'filter' : 'filters'} applied
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-unicef-blue hover:bg-unicef-blue/10 text-xs"
                  onClick={clearAllFilters}
                >
                  Clear all
                </Button>
              </div>
            </SidebarGroup>
          )} */}
          <CategoriesFacets categories={facets.categories} />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </>
  )
}

const CategoriesFacets = ({ categories }: { categories: Category[] }) => {
  const t = useTranslations('global.sidebar')
  const { slug } = useParams()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-bold text-gray-800">
        {t('categoriesFacetsTitle')}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <Filter
          type="checkbox"
          name="f-category"
          options={categories
            .filter((c) => c.slug !== slug)
            .map((c) => ({ label: c.name, value: c.slug }))}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
