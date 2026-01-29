import { useUIStore } from '../../stores/uiStore'
import { useNoteStore } from '../../stores/noteStore'
import { Plus, Search, Settings, FolderOpen } from 'lucide-react'
import NoteList from '../note/NoteList'
import CategoryTree from '../note/CategoryTree'

/**
 * 侧边栏组件
 * 显示笔记列表、分类树和导航按钮
 */
export default function Sidebar() {
  const { sidebarOpen, setView, setSelectedCategory } = useUIStore()
  const { createNote, notes } = useNoteStore()

  // 如果侧边栏未打开，不渲染内容
  if (!sidebarOpen) return null

  /**
   * 处理新建笔记操作
   */
  const handleNewNote = async () => {
    const note = await createNote()
    if (note) {
      setSelectedCategory(null)
      setView('editor')
    }
  }

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold mb-3">G-Note</h1>
        <button
          onClick={handleNewNote}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <FolderOpen className="w-4 h-4" />
          Categories
        </div>
        <CategoryTree />
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-auto">
        <div className="p-3">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Notes ({notes.length})
          </div>
          <NoteList />
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t">
        <button
          onClick={() => setView('settings')}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  )
}
