import { useEffect } from 'react'
import { useUIStore } from './stores/uiStore'
import { useNoteStore } from './stores/noteStore'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Settings from './pages/Settings'

function App() {
  const { view, theme } = useUIStore()
  const { fetchNotes } = useNoteStore()

  useEffect(() => {
    // Initialize theme
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
  }, [theme])

  useEffect(() => {
    // Load notes on app start
    fetchNotes()
  }, [])

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <Home />
      case 'editor':
        return <Editor />
      case 'settings':
        return <Settings />
      default:
        return <Home />
    }
  }

  return <MainLayout>{renderContent()}</MainLayout>
}

export default App
