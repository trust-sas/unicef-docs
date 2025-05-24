'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Book, Media } from '@/payload-types'
import { RichText } from '../rich-text'
import { ViewDocsModalClient } from './view-docs-modal-client'
import { DownloadBookBtn } from './download-book-btn'

type BookViewDetailsProps = {
  gridRowIndex: number
  book: Book
  onClose: () => void
}

export const BookGridItemViewDetails = ({
  gridRowIndex,
  book: bookSelected,
  onClose,
}: BookViewDetailsProps) => {
  const locale = useLocale()
  const t = useTranslations()
  const bookImageSelected = bookSelected?.cover as Media | undefined

  return (
    <div
      className="border px-8 py-10 flex items-center justify-center col-span-full"
      style={{
        gridRowStart: gridRowIndex + 1,
        gridRowEnd: gridRowIndex + 2,
      }}
    >
      <div className="flex gap-2">
        {bookImageSelected?.url && (
          <Image
            src={bookImageSelected.url}
            alt={bookImageSelected.alt ?? 'cover'}
            width={200}
            height={200}
            className="object-contain h-48"
          />
        )}

        <div className="flex flex-col gap-1 max-w-[400px]">
          <Button
            size="icon"
            variant="ghost"
            className="self-end cursor-pointer size-6.5"
            onClick={onClose}
          >
            <XIcon className="size-5" />
          </Button>
          <h3 className="font-bold text-neutral-700">{bookSelected.title}</h3>
          {bookSelected.publishedDate && (
            <p className="capitalize italic text-sm text-neutral-800">
              {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
                new Date(bookSelected.publishedDate),
              )}
            </p>
          )}
          {bookSelected.resume && (
            <div className="text-sm text-neutral-700">
              <RichText
                data={bookSelected.resume}
                className="max-h-[144px] overflow-hidden text-ellipsis"
              />
            </div>
          )}

          <ViewDocsModalClient title={bookSelected.title} doc={(bookSelected.books as Media)!} />
          <div className="space-x-1 mt-2">
            <span className="mr-4">{t('books.downloadBtn')}</span>
            <DownloadBookBtn locale="fr" bookId={bookSelected.id}>
              FR
            </DownloadBookBtn>
            <DownloadBookBtn locale="en" bookId={bookSelected.id}>
              EN
            </DownloadBookBtn>
          </div>
        </div>
      </div>
    </div>
  )
}
