'use client'

import { createContext, use, useRef } from 'react'
import { useStore } from 'zustand'
import { BookStore, createBookStore, defaultBookState } from '@/store/book-store'

export type BookStoreApi = ReturnType<typeof createBookStore>
export const BookStoreContext = createContext<BookStoreApi | undefined>(undefined)

export interface BookStoreProviderProps {
  children: React.ReactNode
}

export const BookStoreProvider = ({ children }: BookStoreProviderProps) => {
  const storeRef = useRef<BookStoreApi | null>(null)

  if (storeRef.current === null) {
    storeRef.current = createBookStore({ ...defaultBookState })
  }

  return <BookStoreContext value={storeRef.current}>{children}</BookStoreContext>
}

export const useBookStore = <T,>(selector: (store: BookStore) => T): T => {
  const bookStoreContext = use(BookStoreContext)

  if (!bookStoreContext) {
    throw new Error('useBookStore must be used within a BookStoreProvider')
  }

  return useStore(bookStoreContext, selector)
}
