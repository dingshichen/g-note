import { registerNoteHandlers } from './note-handlers'
import { registerGitHandlers } from './git-handlers'
import { registerFsHandlers } from './fs-handlers'
import { registerSearchHandlers } from './search-handlers'
import { registerExportHandlers } from './export-handlers'

/**
 * 注册所有 IPC 处理器
 * 用于主进程和渲染进程之间的通信
 */
export function registerIPCHandlers() {
  registerNoteHandlers()
  registerGitHandlers()
  registerFsHandlers()
  registerSearchHandlers()
  registerExportHandlers()

  console.log('All IPC handlers registered')
}
