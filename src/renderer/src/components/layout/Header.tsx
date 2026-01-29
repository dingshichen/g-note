import { useUIStore } from '../../stores/uiStore'
import { useNoteStore } from '../../stores/noteStore'
import { Menu, Save, GitCompareArrows, Download } from 'lucide-react'
import { format } from 'date-fns'

interface HeaderProps {
  currentNote?: {
    id: string
    title: string
    updatedAt: string
  } | null
}

export default function Header({ currentNote }: HeaderProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { saveNote } = useNoteStore()

  const handleSave = () => {
    if (currentNote) {
      saveNote(currentNote.id, {})
    }
  }

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {currentNote && (
          <div>
            <h2 className="font-semibold">{currentNote.title}</h2>
            <p className="text-xs text-muted-foreground">
              Last edited: {format(new Date(currentNote.updatedAt), 'PPp')}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {currentNote && (
          <>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
              title="Save (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
              title="View History"
            >
              <GitCompareArrows className="w-4 h-4" />
              History
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </>
        )}
      </div>
    </header>
  )
}
