import { ipcMain, dialog, shell } from 'electron'
import FileService from '../services/FileService'

/**
 * 注册文件系统相关的 IPC 处理器
 */
export const registerFsHandlers = () => {
  // 保存资源文件（如图片）
  ipcMain.handle('fs:save-asset', async (_event, fileName: string, buffer: ArrayBuffer) => {
    try {
      const data = Buffer.from(buffer)
      const url = await FileService.saveAsset(fileName, data)
      return { success: true, data: { url } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取资源文件路径
  ipcMain.handle('fs:get-asset-path', async (_event, fileName: string) => {
    try {
      const path = FileService.getAssetPath(fileName)
      return { success: true, data: { path } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 打开文件选择对话框
  ipcMain.handle('fs:select-file', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled) {
        return { success: false, error: 'Dialog cancelled' }
      }

      return { success: true, data: { filePath: result.filePaths[0] } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 打开文件保存对话框
  ipcMain.handle('fs:save-file-dialog', async (_event, defaultName: string) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: defaultName,
        filters: [
          { name: 'PDF', extensions: ['pdf'] },
          { name: 'HTML', extensions: ['html'] },
          { name: 'Markdown', extensions: ['md'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled) {
        return { success: false, error: 'Dialog cancelled' }
      }

      return { success: true, data: { filePath: result.filePath } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 读取文件
  ipcMain.handle('fs:read-file', async (_event, filePath: string) => {
    try {
      const content = await FileService.readFile(filePath)
      return { success: true, data: { content } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 写入文件
  ipcMain.handle('fs:write-file', async (_event, filePath: string, content: string) => {
    try {
      await FileService.writeFile(filePath, content)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 检查文件是否存在
  ipcMain.handle('fs:exists', async (_event, filePath: string) => {
    try {
      const exists = await FileService.fileExists(filePath)
      return { success: true, data: { exists } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取用户数据目录路径
  ipcMain.handle('fs:get-user-data-path', async () => {
    try {
      const path = FileService.getUserDataPath()
      return { success: true, data: { path } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 打开文件夹
  ipcMain.handle('fs:open-folder', async (_event, folderPath?: string) => {
    try {
      const path = folderPath || FileService.getUserDataPath()
      await shell.openPath(path)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
