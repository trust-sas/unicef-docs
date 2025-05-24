'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'

import { Media } from '@/payload-types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Props = {
  doc: Media
  title: string
}

export const ViewDocsModalClient = ({ doc, title }: Props) => {
  const t = useTranslations()
  const [shown, setShown] = useState(false)

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <Dialog open={shown} onOpenChange={setShown}>
        <DialogTrigger asChild>
          <Button className="bg-unicef-blue-dark hover:bg-unicef-blue">
            {t('books.readOnlineBtn')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[calc(100%-2rem)] h-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>
              {t('global.header.bannerAppTitle')}:{' '}
              <span className="font-normal text-neutral-700">{title}</span>
            </DialogTitle>
            <DialogDescription>{doc.filename}</DialogDescription>
          </DialogHeader>
          <div className=" gap-4 py-4 overflow-y-auto">
            <div className="max-w-[1000px] w-full mx-auto">
              <Viewer fileUrl={doc.url!} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Worker>
  )
}
