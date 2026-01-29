import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { registerIPCHandlers } from './ipc'

// 主窗口实例
let win: BrowserWindow | null = null

/**
 * 创建应用主窗口
 */
const createWindow = () => {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  })

  win.on('ready-to-show', () => {
    win?.show()
  })

  // 检查是否为开发模式
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  if (isDev) {
    // 开发模式：从开发服务器加载
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

    console.log('Loading dev server from:', devServerUrl)
    win.loadURL(devServerUrl)
    win.webContents.openDevTools()
  } else {
    // 生产模式：加载构建后的 HTML 文件
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/**
 * 应用就绪时的初始化
 */
app.whenReady().then(() => {
  registerIPCHandlers()
  createWindow()

  // macOS 特有：点击 Dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

/**
 * 所有窗口关闭时的处理
 */
app.on('window-all-closed', () => {
  // macOS 以外的平台在所有窗口关闭时退出应用
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
