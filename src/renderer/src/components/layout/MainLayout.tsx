import { useUIStore } from '../../stores/uiStore'
import Sidebar from './Sidebar'
import Header from './Header'

interface MainLayoutProps {
  children: React.ReactNode
  currentNote?: {
    id: string
    title: string
    updatedAt: string
  } | null
}

export default function MainLayout({ children, currentNote }: MainLayoutProps) {
  const { view } = useUIStore()

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {view === 'editor' && <Header currentNote={currentNote} />}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
