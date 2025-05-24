import React from 'react'
import Image from 'next/image'
import { Book, Media } from '@/payload-types'

type BookGridItemProps = {
  book: Book
  onSelect: (index: number) => void
  index: number
}

export const BookGridItem = React.memo(function BookGridItem({
  book,
  onSelect,
  index,
}: BookGridItemProps) {
  const image = book.cover as Media

  return (
    <div className="w-full px-4 py-10 border">
      <button
        className="size-full text-center flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => onSelect(index)}
      >
        {image.url && (
          <Image
            src={image.url}
            alt={image.alt ?? 'cover'}
            width={200}
            height={200}
            className="object-contain h-48"
          />
        )}
        <h3 className="text-sm font-bold text-neutral-700">{book.title}</h3>
      </button>
    </div>
  )
})
