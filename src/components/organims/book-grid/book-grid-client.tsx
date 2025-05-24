'use client'

import { useMemo, useState } from 'react'

import { Book } from '@/payload-types'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { BookGridItemViewDetails } from './book-grid-item-view-details'
import { BookGridItem } from './book-grid-item'

type Props = {
  books: Book[]
}

const BREAKPOINT_GRID_COLUMNS = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
  '2xl': 7,
}

export const BookGridClient = ({ books }: Props) => {
  const breakpoint = useBreakpoint()
  const [indexBookSelected, setIndexBookSelected] = useState<number>(-1)

  const { defaultGridColumnNumber, gridColumnNumber, completedFirstRowColumns } = useMemo(() => {
    const defaultGridColumnNumber = BREAKPOINT_GRID_COLUMNS[breakpoint] ?? 1
    const gridColumnNumber = Math.min(books.length, defaultGridColumnNumber)
    const completedFirstRowColumns = defaultGridColumnNumber - gridColumnNumber

    return { defaultGridColumnNumber, gridColumnNumber, completedFirstRowColumns }
  }, [breakpoint, books.length])

  const gridRowIndex = Math.floor(indexBookSelected / gridColumnNumber) + 1
  const bookSelected = books[indexBookSelected]

  const bookGridItems = useMemo(
    () =>
      books.map((book, index) => (
        <BookGridItem
          key={book.id}
          book={book}
          onSelect={() => setIndexBookSelected(index)}
          index={index}
        />
      )),
    [books],
  )

  const gridItemsToCompleteFirstRowJSX = useMemo(
    () =>
      Array.from({ length: completedFirstRowColumns }).map((_, index) => (
        <div key={`placeholder-${index}`} className="border" />
      )),
    [completedFirstRowColumns],
  )

  return (
    <div
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${defaultGridColumnNumber}, minmax(0, 1fr))` }}
    >
      {bookGridItems}
      {gridItemsToCompleteFirstRowJSX}

      {indexBookSelected > -1 && (
        <BookGridItemViewDetails
          gridRowIndex={gridRowIndex}
          book={bookSelected}
          onClose={() => setIndexBookSelected(-1)}
        />
      )}
    </div>
  )
}
