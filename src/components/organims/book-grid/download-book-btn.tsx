'use client'

import { ReactNode, useEffect, useState } from 'react'
import { TypedLocale } from 'payload'

import { Button } from '@/components/ui/button'

type Props = {
  children: ReactNode
  bookId: string
  locale: TypedLocale
}

export const DownloadBookBtn = ({ children, bookId, locale }: Props) => {
  const [data, setData] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDocument(bookId, locale)
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((error) => {
        setError(error)
        setLoading(false)
      })
  }, [bookId, locale])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {(error as Error).message}</p>

  if (!data) return null

  return (
    <Button size="sm" asChild>
      <a href={data!} download>
        {children}
      </a>
    </Button>
  )
}

export async function fetchDocument(id: string, locale: TypedLocale) {
  const response = await fetch(`/api/books/${id}?depth=1&locale=${locale}&select[books]=true`)

  if (!response.ok) {
    throw new Error('Failed to fetch weather')
  }

  const data = await response.json()

  return data['books']['url'] as string
}
