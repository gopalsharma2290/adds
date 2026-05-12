import { create } from 'zustand'

export type PageId = 'home' | 'experiment-1' | 'experiment-2' | 'experiment-3' | 'about' | 'viva-prep'

interface AppState {
  currentPage: PageId
  sidebarCollapsed: boolean
  setCurrentPage: (page: PageId) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'home',
  sidebarCollapsed: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
