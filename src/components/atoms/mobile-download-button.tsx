import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface MobileDownloadButtonProps {
  count: number
}

export function MobileDownloadButton({ count }: MobileDownloadButtonProps) {
  if (count === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 md:hidden z-50">
      <Button
        variant="secondary"
        className="w-full py-2 rounded-md font-bold bg-unicef-yellow text-unicef-blue"
        aria-label={`Download all ${count} books`}
      >
        <Download className="h-4.5 w-4.5 mr-2" />
        <span>Download All ({count})</span>
      </Button>
    </div>
  )
}
