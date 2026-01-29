import { ipcMain } from 'electron'
import SearchService from '../services/SearchService'

/**
 * 注册搜索相关的 IPC 处理器
 */
export const registerSearchHandlers = () => {
  // 搜索笔记
  ipcMain.handle('search:query', async (_event, query: string) => {
    try {
      const results = await SearchService.search(query)
      return { success: true, data: results }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 搜索并高亮显示匹配内容
  ipcMain.handle('search:query-highlight', async (_event, query: string) => {
    try {
      const results = await SearchService.searchWithHighlight(query)
      return { success: true, data: results }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 重建搜索索引
  ipcMain.handle('search:rebuild-index', async () => {
    try {
      // 需要在 SearchService 中添加公共的重建方法
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
