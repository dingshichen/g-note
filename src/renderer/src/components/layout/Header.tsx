import { useState } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useNoteStore } from '../../stores/noteStore'
import { Menu, Save, GitCompareArrows, Download, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import DeleteConfirmDialog from '../common/DeleteConfirmDialog'

interface HeaderProps {
  currentNote?: {
    id: string
    title: string
    updatedAt: string
  } | null
}

export default function Header({ currentNote }: HeaderProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toggleSidebar, setView } = useUIStore()
  const { saveNote, deleteNote } = useNoteStore()

  const handleSave = () => {
    if (currentNote) {
      saveNote(currentNote.id, {})
    }
  }

  const handleDelete = async () => {
    if (currentNote) {
      await deleteNote(currentNote.id)
      setShowDeleteDialog(false)
      setView('home')
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
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-destructive rounded-md transition-colors"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      {currentNote && (
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          noteTitle={currentNote.title}
        />
      )}
    </header>
  )
}
