import { ipcMain } from 'electron'
import GitService from '../services/GitService'

/**
 * 注册 Git 相关的 IPC 处理器
 */
export const registerGitHandlers = () => {
  // 获取笔记的版本历史
  ipcMain.handle('git:history', async (_event, noteId: string, limit: number = 20) => {
    try {
      const history = await GitService.getHistory(noteId, limit)
      return { success: true, data: history }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 手动提交
  ipcMain.handle('git:commit', async (_event, noteId: string, message?: string) => {
    try {
      const commitHash = await GitService.autoCommit(noteId, message)
      if (!commitHash) {
        return { success: false, error: 'Commit failed' }
      }
      return { success: true, data: { hash: commitHash } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 检出特定版本
  ipcMain.handle('git:checkout', async (_event, noteId: string, commitHash: string) => {
    try {
      const content = await GitService.checkoutVersion(noteId, commitHash)
      if (!content) {
        return { success: false, error: 'Checkout failed' }
      }

      // 提交检出操作
      await GitService.autoCommit(noteId, `Restore note ${noteId} to version ${commitHash}`)

      return { success: true, data: { content } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取两个提交之间的差异
  ipcMain.handle('git:diff', async (_event, noteId: string, hash1: string, hash2: string) => {
    try {
      const diff = await GitService.getDiff(noteId, hash1, hash2)
      if (!diff) {
        return { success: false, error: 'Failed to get diff' }
      }
      return { success: true, data: diff }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 推送到远程仓库
  ipcMain.handle('git:push', async (_event, remoteUrl: string, token: string, branch?: string) => {
    try {
      const success = await GitService.push(remoteUrl, token, branch)
      return { success }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 从远程仓库拉取
  ipcMain.handle('git:pull', async (_event, remoteUrl: string, token: string, branch?: string) => {
    try {
      const success = await GitService.pull(remoteUrl, token, branch)
      return { success }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 创建快照
  ipcMain.handle('git:snapshot', async (_event, name: string) => {
    try {
      const tagName = await GitService.createSnapshot(name)
      if (!tagName) {
        return { success: false, error: 'Failed to create snapshot' }
      }
      return { success: true, data: { tagName } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // 获取快照列表
  ipcMain.handle('git:snapshots', async () => {
    try {
      const snapshots = await GitService.getSnapshots()
      return { success: true, data: snapshots }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
