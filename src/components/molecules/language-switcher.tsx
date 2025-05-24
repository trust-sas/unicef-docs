import { useState, useTransition } from 'react'
import { GlobeIcon } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'

import { usePathname, useRouter } from '@/integrations/i18n/routing'
import localization from '@/integrations/i18n/localization'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'

export const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false)

  const locale = useLocale()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const pathname = usePathname()
  const params = useParams()
  const currentLanguage = localization.locales.find((lang) => lang.code === locale)!

  function onSelectChange(value: string) {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: value },
      )
      setIsOpen(false)
    })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-unicef-blue-dark hover:text-white"
        >
          <GlobeIcon className="h-4 w-4 mr-0.5" />
          <span className="hidden md:inline">{currentLanguage.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {localization.locales
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              className={`flex items-center ${locale === lang.code ? 'bg-unicef-blue/10 font-medium' : ''}`}
              onClick={() => onSelectChange(lang.code)}
            >
              {lang.label}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
