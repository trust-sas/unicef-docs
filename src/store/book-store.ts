import { createStore } from 'zustand'

export type BookState = {
  searchQuery: string
  isSidebarOpen: boolean
}

export type BookActions = {
  toggleSidebar: () => void
  closeSidebar: () => void
}

export type BookStore = BookState & BookActions

export const defaultBookState: BookState = {
  searchQuery: '',
  isSidebarOpen: false,
}

export const createBookStore = (initState: BookState = defaultBookState) => {
  return createStore<BookStore>()((set) => ({
    ...initState,
    closeSidebar: () => set({ isSidebarOpen: false }),
    toggleSidebar: () =>
      set((state: BookStore) => ({ ...state, isSidebarOpen: !state.isSidebarOpen })),
  }))
}
