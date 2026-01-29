import { ipcMain } from 'electron'
import ExportService from '../services/ExportService'

/**
 * 注册导出相关的 IPC 处理器
 */
export const registerExportHandlers = () => {
  // 导出为 PDF
  ipcMain.handle('export:pdf', async (_event, noteId: string) => {
    try {
      const pdf = await ExportService.exportToPDF(noteId)
      return { success: true, data: { pdf } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 导出为 HTML
  ipcMain.handle('export:html', async (_event, noteId: string) => {
    try {
      const html = await ExportService.exportToHTML(noteId)
      return { success: true, data: { html } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 导出为 Markdown
  ipcMain.handle('export:markdown', async (_event, noteId: string) => {
    try {
      const markdown = await ExportService.exportToMarkdown(noteId)
      return { success: true, data: { markdown } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 批量导出为 PDF
  ipcMain.handle('export:batch-pdf', async (_event, noteIds: string[]) => {
    try {
      const pdfs = await ExportService.batchExportToPDF(noteIds)
      return { success: true, data: { pdfs } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
