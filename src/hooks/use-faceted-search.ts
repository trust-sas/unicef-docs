import { useCallback, useMemo } from 'react'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

export function useFacetedSearch(paramKey: string) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedValues = useMemo(() => {
    return searchParams.getAll(paramKey)
  }, [searchParams, paramKey])

  const toggleValue = useCallback(
    (value: string) => {
      const url = new URL(window.location.href)
      const currentValues = url.searchParams.getAll(paramKey)

      if (currentValues.includes(value)) {
        url.searchParams.delete(paramKey)
        currentValues
          .filter((v) => v !== value)
          .forEach((v) => url.searchParams.append(paramKey, v))
      } else {
        url.searchParams.append(paramKey, value)
      }

      router.push(url.pathname + url.search)
    },
    [paramKey, router],
  )

  const setValue = useCallback(
    (value: string | null) => {
      const url = new URL(window.location.href)
      if (value === null) {
        url.searchParams.delete(paramKey)
      } else {
        url.searchParams.set(paramKey, value)
      }
      router.push(url.pathname + url.search)
    },
    [paramKey, router],
  )

  const clearFilter = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete(paramKey)
    router.push(url.pathname + url.search)
  }, [paramKey, router])

  return { selectedValues, toggleValue, setValue, clearFilter }
}
