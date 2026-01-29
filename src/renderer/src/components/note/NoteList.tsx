import { useState } from 'react'
import { useNoteStore } from '../../stores/noteStore'
import { useUIStore } from '../../stores/uiStore'
import { format } from 'date-fns'
import { FileText, Trash2 } from 'lucide-react'
import DeleteConfirmDialog from '../common/DeleteConfirmDialog'

/**
 * 笔记列表组件
 * 显示所有笔记的列表，点击可打开笔记
 */
export default function NoteList() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string } | null>(null)
  const { notes, currentNote, fetchNote, deleteNote } = useNoteStore()
  const { setView } = useUIStore()

  /**
   * 处理笔记点击事件
   * 加载笔记内容并切换到编辑器视图
   */
  const handleNoteClick = async (id: string) => {
    await fetchNote(id)
    setView('editor')
  }

  /**
   * 处理删除笔记事件
   * 打开删除确认对话框
   */
  const handleDeleteClick = (e: React.MouseEvent, note: { id: string; title: string }) => {
    e.stopPropagation()
    setNoteToDelete(note)
    setShowDeleteDialog(true)
  }

  /**
   * 确认删除笔记
   */
  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete.id)
      setShowDeleteDialog(false)
      setNoteToDelete(null)
    }
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
          <div
            key={note.id}
            className={`group relative rounded-md transition-colors ${
              currentNote?.id === note.id
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <button
              onClick={() => handleNoteClick(note.id)}
              className="w-full text-left p-3 rounded-md"
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
            
            {/* Delete button - only visible on hover */}
            <button
              onClick={(e) => handleDeleteClick(e, note)}
              className="absolute top-3 right-3 p-1.5 rounded-md text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        noteTitle={noteToDelete?.title}
      />
    </div>
  )
}
