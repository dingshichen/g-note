import { ipcMain } from 'electron'
import NoteService from '../services/NoteService'
import GitService from '../services/GitService'
import SearchService from '../services/SearchService'

/**
 * 注册笔记相关的 IPC 处理器
 */
export const registerNoteHandlers = () => {
  // 列出所有笔记
  ipcMain.handle('notes:list', async () => {
    try {
      const notes = await NoteService.getAllNotes()
      return { success: true, data: notes }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 根据 ID 获取笔记
  ipcMain.handle('notes:get', async (_event, id: string) => {
    try {
      const note = await NoteService.getNote(id)
      if (!note) {
        return { success: false, error: 'Note not found' }
      }
      return { success: true, data: note }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 创建新笔记
  ipcMain.handle('notes:create', async (_event, title?: string) => {
    try {
      const note = await NoteService.createNote(title)

      // 自动提交到 Git
      await GitService.autoCommit(note.id, `Create note: ${note.title}`)

      // 更新搜索索引
      await SearchService.indexNote(note)

      return { success: true, data: note }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 更新笔记
  ipcMain.handle('notes:update', async (_event, id: string, updates: any) => {
    try {
      const note = await NoteService.updateNote(id, updates)
      if (!note) {
        return { success: false, error: 'Note not found' }
      }

      // 自动提交到 Git
      await GitService.autoCommit(id, `Update note: ${note.title}`)

      // 更新搜索索引
      await SearchService.updateNoteIndex(note)

      return { success: true, data: note }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 删除笔记
  ipcMain.handle('notes:delete', async (_event, id: string) => {
    try {
      await NoteService.deleteNote(id)

      // 自动提交删除操作
      await GitService.autoCommit(id, `Delete note: ${id}`)

      // 从搜索索引中移除
      await SearchService.removeFromIndex(id)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取笔记元数据
  ipcMain.handle('notes:metadata', async () => {
    try {
      const metadata = await NoteService.getNotesMetadata()
      return { success: true, data: metadata }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
