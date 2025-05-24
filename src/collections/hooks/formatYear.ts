import type { FieldHook } from 'payload'

const format = (val: string): string => (val.includes('years') ? val : `${val.trim()} years`)

export const formatYear =
  (fallback: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    // return format(value)

    if (typeof value === 'string') {
      return format(value)
    }

    if (operation === 'create') {
      const fallbackData = data?.[fallback] || originalDoc?.[fallback]

      if (fallbackData && typeof fallbackData === 'string') {
        return format(fallbackData)
      }
    }

    return value
  }
