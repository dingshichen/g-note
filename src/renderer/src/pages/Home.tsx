import { useEffect, useState, useCallback } from 'react'
import { useNoteStore } from '../stores/noteStore'
import { useUIStore } from '../stores/uiStore'
import SearchBar from '../components/common/SearchBar'
import { FileText } from 'lucide-react'

export default function Home() {
  const { notes, fetchNotes, fetchNote, createNote } = useNoteStore()
  const { setView } = useUIStore()
  const [searchResults, setSearchResults] = useState<typeof notes>([])

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleSearchResults = useCallback((results: typeof notes) => {
    setSearchResults(results)
  }, [])

  const handleCreateNote = async () => {
    const newNote = await createNote()
    if (newNote) {
      setView('editor')
    }
  }

  const displayNotes = searchResults.length > 0 ? searchResults : notes

  return (
    <div className="h-full flex flex-col">
      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to G-Note</h1>
          <p className="text-muted-foreground">Your personal knowledge base</p>
        </div>

        <div className="mb-8">
          <SearchBar onResults={handleSearchResults} />
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">
            {searchResults.length > 0 ? `Search Results (${displayNotes.length})` : 'Recent Notes'}
          </h2>
        </div>

        {displayNotes.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first note to get started
            </p>
<button
              onClick={handleCreateNote}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Create Note
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayNotes.map((note) => (
              <button
                key={note.id}
                onClick={async () => {
                  await fetchNote(note.id)
                  setView('editor')
                }}
                className="text-left p-4 border rounded-lg hover:border-primary transition-colors bg-card"
              >
                <h3 className="font-semibold mb-1">{note.title || 'Untitled'}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {note.markdown.slice(0, 200)}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  {note.category && <span>• {note.category}</span>}
                  {note.tags.length > 0 && (
                    <span>• {note.tags.slice(0, 3).join(', ')}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
