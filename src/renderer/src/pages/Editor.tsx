import { useEffect, useState } from 'react'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import TipTapEditor from '../components/editor/TipTapEditor'
import VersionHistory from '../components/git/VersionHistory'
import DiffViewer from '../components/git/DiffViewer'
import { GitCompareArrows } from 'lucide-react'

type Tab = 'editor' | 'history' | 'diff'

export default function Editor() {
  const { currentNote, saveNote } = useNoteStore()
  const { setView } = useUIStore()
  const [activeTab, setActiveTab] = useState<Tab>('editor')

  useEffect(() => {
    if (!currentNote) {
      setView('home')
    }
  }, [currentNote, setView])

  if (!currentNote) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No note selected</p>
      </div>
    )
  }

  const handleEditorUpdate = (updates: Partial<typeof currentNote>) => {
    saveNote(currentNote.id, updates)
  }

  const handleVersionRestore = () => {
    // Refresh note after restore
    // The store should handle this automatically
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-1 px-4">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'editor'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <GitCompareArrows className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'editor' && (
          <TipTapEditor note={currentNote} onUpdate={handleEditorUpdate} />
        )}
        {activeTab === 'history' && (
          <div className="p-8 max-w-4xl mx-auto">
            <VersionHistory noteId={currentNote.id} onRestore={handleVersionRestore} />
          </div>
        )}
      </div>
    </div>
  )
}
