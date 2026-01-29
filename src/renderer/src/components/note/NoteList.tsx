import { useNoteStore } from '../../stores/noteStore'
import { useUIStore } from '../../stores/uiStore'
import { format } from 'date-fns'
import { FileText } from 'lucide-react'

/**
 * 笔记列表组件
 * 显示所有笔记的列表，点击可打开笔记
 */
export default function NoteList() {
  const { notes, currentNote, fetchNote } = useNoteStore()
  const { setView } = useUIStore()

  /**
   * 处理笔记点击事件
   * 加载笔记内容并切换到编辑器视图
   */
  const handleNoteClick = async (id: string) => {
    await fetchNote(id)
    setView('editor')
  }

  return (
    <div className="space-y-1">
      {notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No notes yet</p>
          <p className="text-xs">Create your first note to get started</p>
        </div>
      ) : (
        notes.map((note) => (
          <button
            key={note.id}
            onClick={() => handleNoteClick(note.id)}
            className={`w-full text-left p-3 rounded-md transition-colors ${
              currentNote?.id === note.id
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <div className="font-medium text-sm truncate mb-1">
              {note.title || 'Untitled'}
            </div>
            <div className="text-xs text-muted-foreground mb-1">
              {format(new Date(note.updatedAt), 'MMM d, yyyy')}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {note.markdown.slice(0, 100)}
            </div>
          </button>
        ))
      )}
    </div>
  )
}
