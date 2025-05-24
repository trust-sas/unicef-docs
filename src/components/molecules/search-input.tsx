'use client'

import type React from 'react'

import { useState } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  initialValue?: string
}

export function SearchInput({
  onSearch,
  placeholder = 'Search...',
  className,
  initialValue = '',
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (e.target.value === '') {
      onSearch('')
    }
  }

  const clearSearch = () => {
    setValue('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <div className="flex">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={cn(
            'h-10 w-full rounded-l-md border-0 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-unicef-yellow',
            'flex-1',
          )}
          aria-label="Search books"
        />
        <button
          type="submit"
          className="flex h-10 items-center justify-center rounded-r-md bg-unicef-yellow px-3 text-unicef-blue hover:bg-unicef-yellow/90"
          aria-label="Search"
        >
          <SearchIcon size={20} />
        </button>
      </div>

      {value && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-[3.2rem] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <XIcon size={16} />
        </button>
      )}
    </form>
  )
}
