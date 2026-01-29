import { create } from 'zustand'

type View = 'home' | 'editor' | 'settings'

/**
 * UI 状态管理接口
 */
interface UIState {
  view: View
  sidebarOpen: boolean
  searchQuery: string
  selectedCategory: string | null
  theme: 'light' | 'dark' | 'system'

  // 操作方法
  setView: (view: View) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

/**
 * UI 状态管理 Store
 * 管理应用的用户界面状态，包括视图、侧边栏、搜索和主题等
 */
export const useUIStore = create<UIState>((set) => ({
  // 初始状态
  view: 'home',
  sidebarOpen: true,
  searchQuery: '',
  selectedCategory: null,
  theme: (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system',

  // 操作方法
  setView: (view) => set({ view }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  /**
   * 设置主题
   * @param theme 主题模式：light、dark 或 system
   */
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })

    // 应用主题
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }
}))
